import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { PROFILE_VISITS_COLLECTION, USERS_COLLECTION, auth, db } from "../../Contexts/Session/Firebase";
import { eachDayOfInterval, endOfWeek, format, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { ApexOptions } from "apexcharts";
import { Button } from "@mui/material";

const ProfileVisits = () => {
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
          start: startOfWeek(new Date(), { weekStartsOn: 1 }),
          end: endOfWeek(new Date(), { weekStartsOn: 1 }),
        }).map((date) => format(date, "dd/MM")),
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

  useEffect(() => {
    const fetchVisits = async () => {
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
      const visitorsMap = new Set();
      visitsSnapshot.forEach((doc) => {
        const visitedAt = doc.data().visitedAt.toDate();
        const dayOfWeek = visitedAt.getDay();
        totalVisits[dayOfWeek]++;
        if (!visitorsMap.has(doc.data().visitor)) {
          visitorsMap.add(doc.data().visitor);
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
            }).map((date) => format(date, "dd/MM")),
          },
        },
        series: [
          { ...prevState.series[0], data: totalVisits },
          { ...prevState.series[1], data: uniqueVisitors },
        ],
      }));
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
    <div>
      <div>
        <Button onClick={handlePrevWeek}>Previous Week</Button>
        <Button onClick={handleNextWeek}>Next Week</Button>
      </div>
      <Chart options={chartData.options} series={chartData.series} type="area" width="100%" height={320} />
    </div>
  );
};

export default ProfileVisits;