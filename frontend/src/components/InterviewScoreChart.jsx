import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const InterviewScoreChart = ({ scores }) => {
  const data = {
    labels: scores.map((_, i) => `#${i + 1}`),
    datasets: [
      {
        data: scores,
        backgroundColor: "#3b82f6",
        hoverBackgroundColor: "#2563eb",
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => `Score: ${ctx.raw}%`,
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
    animation: {
      duration: 800,
    },
    // Disable hover effects that cause bars to grow
    interaction: {
      intersect: false,
      mode: "index",
    },
    onHover: (event, chartElement) => {
      // No visual changes on hover
    },
  };

  return <Bar data={data} options={options} />;
};

export default InterviewScoreChart;
