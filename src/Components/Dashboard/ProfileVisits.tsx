import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { PROFILE_VISITS_COLLECTION, USERS_COLLECTION, auth, db } from "../../Contexts/Session/Firebase";
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import { ApexOptions } from "apexcharts";

const ProfileVisits = () => {
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: "profile-visits",
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: eachDayOfInterval({
          start: startOfWeek(new Date(), { weekStartsOn: 1 }),
          end: endOfWeek(new Date(), { weekStartsOn: 1 }),
        }).map((date) => format(date, "EEE")),
      },
      stroke: {
        curve: "smooth",
      },
    },
    series: [
      {
        name: "Total Visits",
        data: [],
      },
      {
        name: "Unique Visitors",
        data: [],
      },
    ],
  });

  useEffect(() => {
    const fetchVisits = async () => {
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

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
        series: [
          { ...prevState.series[0], data: totalVisits },
          { ...prevState.series[1], data: uniqueVisitors },
        ],
      }));
    };

    fetchVisits();
  }, []);

  return (
    <div>
      <Chart options={chartData.options} series={chartData.series} type="line" width="100%" height={320} />
    </div>
  );
};

export default ProfileVisits;
