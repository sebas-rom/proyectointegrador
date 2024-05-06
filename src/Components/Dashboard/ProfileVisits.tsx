import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { PROFILE_VISITS_COLLECTION, USERS_COLLECTION, auth, db } from "../../Contexts/Session/Firebase";
import { eachDayOfInterval, endOfWeek, format, startOfWeek, addWeeks, subWeeks, isSameWeek } from "date-fns";
import { ApexOptions } from "apexcharts";
import { Box, Button, CircularProgress, Stack } from "@mui/material";

const ProfileVisits = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{
    options: ApexOptions;
    series: { name: string; data: number[] }[];
  }>({
    options: {
      chart: {
        id: "profile-visits",
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: eachDayOfInterval({
          start: startOfWeek(new Date()),
          end: endOfWeek(new Date()),
        }).map((date) => format(date, "dd/MM")),
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

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true); // Start loading
      const currentWeekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const currentWeekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
      const visitsQuery = query(
        collection(db, USERS_COLLECTION, auth.currentUser.uid, PROFILE_VISITS_COLLECTION),
        where("visitedAt", ">=", currentWeekStart),
        where("visitedAt", "<=", currentWeekEnd)
      );
      const visitsSnapshot = await getDocs(visitsQuery);
      const totalVisits = Array(7).fill(0);
      const uniqueVisitors = Array(7).fill(0);

      // Initialize visitors map for each day
      const visitorsMapPerDay = eachDayOfInterval({
        start: currentWeekStart,
        end: currentWeekEnd,
      }).reduce((acc, date) => {
        acc[format(date, "dd/MM")] = new Set();
        return acc;
      }, {});

      visitsSnapshot.forEach((doc) => {
        const visitedAt = doc.data().visitedAt.toDate();
        let dayOfWeek = visitedAt.getDay();
        const formattedDate = format(visitedAt, "dd/MM");
        if (dayOfWeek == 0) {
          dayOfWeek = 6;
        } else {
          dayOfWeek--;
        }
        totalVisits[dayOfWeek]++;
        if (!visitorsMapPerDay[formattedDate].has(doc.data().visitor)) {
          visitorsMapPerDay[formattedDate].add(doc.data().visitor);
          uniqueVisitors[dayOfWeek]++;
        }
      });

      setChartData((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            ...prevState.options.xaxis,
            categories: eachDayOfInterval({
              start: currentWeekStart,
              end: currentWeekEnd,
            }).map((date) => {
              const formatString = isCurrentWeek(currentWeek) ? "EEE" : "dd/MM"; // EEE will format as Mon, Tue, etc.
              return format(date, formatString);
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
  }, [currentWeek]);

  const handlePrevWeek = () => {
    setCurrentWeek((prevWeek) => subWeeks(prevWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prevWeek) => addWeeks(prevWeek, 1));
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
        <Button onClick={handlePrevWeek}>Previous Week</Button>
        <Button onClick={handleNextWeek}>Next Week</Button>
      </Stack>
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
      <Box flexGrow={1}>
        <Chart options={chartData.options} series={chartData.series} type="area" height={"100%"} />
      </Box>
    </Box>
  );
};

export default ProfileVisits;
