import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { PROFILE_VISITS_COLLECTION, USERS_COLLECTION, auth, db } from "../../Contexts/Session/Firebase";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
  addWeeks,
  subWeeks,
  isSameWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from "date-fns";
import { ApexOptions } from "apexcharts";
import { Box, Button, CircularProgress, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useThemeContext } from "../../Contexts/Theming/ThemeContext";

const ProfileVisits = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{
    options: ApexOptions;
    series: { name: string; data: number[] }[];
  }>({
    options: {
      theme: {
        mode: "dark",
      },
      chart: {
        background: "transparent",
        id: "profile-visits",
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        x: {
          show: false,
        },
      },
      xaxis: {
        categories: eachDayOfInterval({
          start: startOfWeek(new Date()),
          end: endOfWeek(new Date()),
        }).map((date) => format(date, "EEE")),
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            if (Number.isInteger(val)) {
              return val.toString();
            }
          },
          show: true,
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
    },
    series: [
      { name: "Total Visits", data: [] },
      { name: "Unique Visitors", data: [] },
    ],
  });
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const isCurrentWeek = (date) => {
    return isSameWeek(date, new Date(), { weekStartsOn: 1 });
  };

  const [viewingWeeks, setViewingWeeks] = useState(true);
  const { themeColor } = useThemeContext();

  useEffect(() => {
    setCurrentWeek(new Date());
  }, [viewingWeeks]);

  useEffect(() => {
    setChartData((prevState) => ({
      ...prevState,
      options: {
        ...prevState.options,
        theme: {
          mode: themeColor === "dark" ? "dark" : "light",
        },
      },
    }));
  }, [themeColor]);

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true); // Start loading
      const currentStart = viewingWeeks ? startOfWeek(currentWeek, { weekStartsOn: 1 }) : startOfMonth(currentWeek);
      const currentEnd = viewingWeeks ? endOfWeek(currentWeek, { weekStartsOn: 1 }) : endOfMonth(currentWeek);

      const visitsQuery = query(
        collection(db, USERS_COLLECTION, auth.currentUser.uid, PROFILE_VISITS_COLLECTION),
        where("visitedAt", ">=", currentStart),
        where("visitedAt", "<=", currentEnd)
      );
      const visitsSnapshot = await getDocs(visitsQuery);
      const numDays = viewingWeeks ? 7 : eachDayOfInterval({ start: currentStart, end: currentEnd }).length;
      const totalVisits = Array(numDays).fill(0);
      const uniqueVisitors = Array(numDays).fill(0);

      // Initialize visitors map for each day
      const visitorsMapPerDay = eachDayOfInterval({
        start: currentStart,
        end: currentEnd,
      }).reduce((acc, date) => {
        acc[format(date, "dd/MM")] = new Set();
        return acc;
      }, {});

      visitsSnapshot.forEach((doc) => {
        const visitedAt = doc.data().visitedAt.toDate();
        let dayOfInterval;
        if (viewingWeeks) {
          dayOfInterval = visitedAt.getDay();
          if (dayOfInterval == 0) {
            dayOfInterval = 6;
          } else {
            dayOfInterval--;
          }
        } else {
          dayOfInterval = visitedAt.getDate() - 1;
        }

        if (dayOfInterval >= 0 && dayOfInterval < (viewingWeeks ? 7 : numDays)) {
          const formattedDate = format(visitedAt, "dd/MM");
          totalVisits[dayOfInterval]++;
          if (!visitorsMapPerDay[formattedDate].has(doc.data().visitor)) {
            visitorsMapPerDay[formattedDate].add(doc.data().visitor);
            uniqueVisitors[dayOfInterval]++;
          }
        }
      });

      setChartData((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            ...prevState.options.xaxis,
            categories: viewingWeeks
              ? eachDayOfInterval({
                  start: startOfWeek(currentWeek, { weekStartsOn: 1 }),
                  end: endOfWeek(currentWeek, { weekStartsOn: 1 }),
                }).map((date) => {
                  const formatString = isCurrentWeek(currentWeek) ? "EEE" : "dd/MM";
                  return format(date, formatString);
                })
              : eachDayOfInterval({
                  start: currentStart,
                  end: currentEnd,
                }).map((date, index, array) => {
                  // Show only every nth date label
                  const numberOfLabelsToShow = 10; // Adjust this number as needed
                  const step = Math.ceil(array.length / numberOfLabelsToShow);
                  if (index % step === 0) {
                    return format(date, "dd/MM");
                  } else {
                    return "";
                  }
                }),
          },
        },
        series: [
          { ...prevState.series[0], data: totalVisits },
          { ...prevState.series[1], data: uniqueVisitors },
        ],
      }));
      setLoading(false); // Finish loading
    };
    fetchVisits();
  }, [currentWeek, viewingWeeks]);

  const handlePrevPeriod = () => {
    setCurrentWeek((prevPeriod) => (viewingWeeks ? subWeeks(prevPeriod, 1) : subMonths(prevPeriod, 1)));
  };

  const handleNextPeriod = () => {
    setCurrentWeek((prevPeriod) => (viewingWeeks ? addWeeks(prevPeriod, 1) : addMonths(prevPeriod, 1)));
  };

  return (
    <Box width="100%" flexGrow={1} height={"100%"} sx={{ display: "flex", flexDirection: "column" }}>
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        sx={{
          paddingLeft: 2,
          paddingRight: 2,
          paddingTop: 1,
        }}
      >
        <Tooltip title={viewingWeeks ? "Previous Week" : "Previous Month"}>
          <Button onClick={handlePrevPeriod}>
            <ArrowBackIosIcon />
          </Button>
        </Tooltip>

        <ToggleButtonGroup value={viewingWeeks} exclusive size="small" color="primary">
          <ToggleButton value={true} onClick={() => setViewingWeeks(true)}>
            Week
          </ToggleButton>
          <ToggleButton value={false} onClick={() => setViewingWeeks(false)}>
            Month
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title={viewingWeeks ? "Next Week" : "Next Month"}>
          <Button onClick={handleNextPeriod}>
            <ArrowForwardIosIcon />
          </Button>
        </Tooltip>
      </Stack>

      <Box flexGrow={1} position="relative">
        {loading && (
          <Box
            width="100%"
            height="100%"
            position="absolute"
            top={0}
            left={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor={"rgba(255, 255, 255, 0.8)"}
            zIndex={20}
          >
            <CircularProgress />
          </Box>
        )}
        <Chart options={chartData.options} series={chartData.series} type="area" height={"100%"} />
      </Box>
    </Box>
  );
};

export default ProfileVisits;