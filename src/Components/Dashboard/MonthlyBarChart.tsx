import React, { useEffect, useState } from "react";

// material-ui
import { useTheme, Theme } from "@mui/material/styles";

// third-party
import ReactApexChart from "react-apexcharts";

// ApexCharts types
import { ApexOptions } from "apexcharts";
import { Box, Stack, Typography } from "@mui/material";
import CustomPaper from "../CustomMUI/CustomPaper";

interface SeriesItem {
  data: number[];
}

// chart options with type annotation
const barChartOptions: ApexOptions = {
  chart: {
    type: "bar",
    height: 365,
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      columnWidth: "45%",
      borderRadius: 4,
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: false,
  },
  grid: {
    show: false,
  },
};

// ==============================|| MONTHLY BAR CHART ||============================== //

const MonthlyBarChart: React.FC = () => {
  const theme: Theme = useTheme();

  // Assuming theme.palette.text.primary and theme.palette.info.light are strings:
  const { primary, secondary } = theme.palette.text;
  const info: string = theme.palette.info.light;

  const [series] = useState<SeriesItem[]>([
    {
      data: [80, 95, 70, 42, 65, 55, 78],
    },
  ]);

  const [options, setOptions] = useState<ApexOptions>(barChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [info],
      xaxis: {
        ...prevState.xaxis,
        labels: {
          ...prevState.xaxis?.labels,
          style: {
            colors: [secondary, secondary, secondary, secondary, secondary, secondary, secondary],
          },
        },
      },
      tooltip: {
        theme: "light",
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primary, info, secondary]);

  return (
    <CustomPaper
      sx={{
        padding: { sm: 2, xs: 1 },
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h6" color="textSecondary">
          This Week Statistics
        </Typography>
        <Typography variant="h3">$7,650</Typography>
      </Stack>
      <div id="chart">
        <ReactApexChart options={options} series={series} type="bar" height={365} />
      </div>
    </CustomPaper>
  );
};

export default MonthlyBarChart;
