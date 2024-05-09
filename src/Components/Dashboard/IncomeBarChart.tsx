import React, { useEffect, useState } from "react";

// material-ui
import { useTheme, Theme } from "@mui/material/styles";

// third-party
import ReactApexChart from "react-apexcharts";

// ApexCharts types
import { ApexOptions } from "apexcharts";
import { Box, Stack, Typography } from "@mui/material";

// chart options with type annotation
const barChartOptions: ApexOptions = {
  chart: {
    type: "bar",
    toolbar: {
      show: true,
    },
  },
  plotOptions: {
    bar: {
      columnWidth: "50%",
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
      show: true,
    },
  },
  yaxis: {
    show: true,
    labels: {
      formatter: (value) => `$${value}`,
    },
  },
  grid: {
    show: true,
  },
};

// ==============================|| MONTHLY BAR CHART ||============================== //

const IncomeBarChart: React.FC<{ incomes: number[] }> = ({ incomes }) => {
  if (incomes.length !== 7) {
    throw new Error("Incomes array must have 7 numbers, one for each day of the week.");
  }

  const theme: Theme = useTheme();
  const { primary, secondary } = theme.palette.text;
  const info: string = theme.palette.info.light;

  const [totalIncome, setTotalIncome] = useState<number>(0);

  useEffect(() => {
    // Calculate total income by summing up the incomes array
    const total = incomes.reduce((acc, curr) => acc + curr, 0);
    setTotalIncome(total);
  }, [incomes]);

  const [options, setOptions] = useState<ApexOptions>({
    ...barChartOptions,
    colors: [info],
  });

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
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
  }, [primary, info, secondary]);

  const series = [
    {
      name: "Income",
      data: incomes,
    },
  ];

  return (
    <Box width="100%" flexGrow={1} height={"100%"} sx={{ display: "flex", flexDirection: "column" }}>
      <Stack spacing={2} sx={{ padding: 2 }}>
        <Typography variant="h6" color="textSecondary">
          This Week Statistics
        </Typography>
        <Typography variant="h3">${totalIncome.toLocaleString()}</Typography>
      </Stack>
      <Box flexGrow={1}>
        <ReactApexChart options={options} series={series} type="bar" height={"100%"} width={"100%"} />
      </Box>
    </Box>
  );
};

export default IncomeBarChart;
