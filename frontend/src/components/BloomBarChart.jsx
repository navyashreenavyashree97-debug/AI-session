import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BLOOM_CONFIG } from './BloomBadge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BloomBarChart({ data, title = "Bloom's Level-Wise Performance Breakdown" }) {
  const levels = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE'];
  const labels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  const scores = levels.map((lvl) => {
    if (!data) return 0;
    if (typeof data[lvl] === 'number') return data[lvl];
    if (data[lvl] && typeof data[lvl].percentage === 'number') return data[lvl].percentage;
    if (data[lvl] && typeof data[lvl].average === 'number') return data[lvl].average;
    return 0;
  });

  const backgroundColors = levels.map((lvl) => BLOOM_CONFIG[lvl]?.color || '#4F46E5');

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Mastery (%)',
        data: scores,
        backgroundColor: backgroundColors,
        borderRadius: 6,
        borderWidth: 0,
        maxBarThickness: 45,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: (value) => `${value}%`,
          color: '#64748B',
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.8)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#334155',
          font: { weight: '600', size: 12 },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => ` Mastery Score: ${context.raw}%`,
        },
      },
    },
  };

  return (
    <div className="w-full h-80 flex flex-col">
      {title && <h4 className="text-sm font-semibold text-slate-700 mb-2">{title}</h4>}
      <div className="w-full h-72">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
