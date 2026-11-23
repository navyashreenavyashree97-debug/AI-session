import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function BloomRadarChart({ data, title = "Bloom's Taxonomy Cognitive Mastery (%)" }) {
  const levels = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE'];
  const labels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  // Handle data mapping
  const values = levels.map((lvl) => {
    if (!data) return 0;
    if (typeof data[lvl] === 'number') return data[lvl];
    if (data[lvl] && typeof data[lvl].percentage === 'number') return data[lvl].percentage;
    return 0;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Cognitive Mastery Score (%)',
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.25)', // Indigo transparent
        borderColor: 'rgba(79, 70, 229, 0.9)',
        borderWidth: 2.5,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#4F46E5',
        pointRadius: 4.5,
        pointHoverRadius: 6,
      },
      {
        label: 'Target Benchmark (75%)',
        data: [75, 75, 75, 75, 75, 75],
        borderColor: 'rgba(16, 185, 129, 0.5)', // Emerald dashed
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(148, 163, 184, 0.25)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
        pointLabels: {
          font: {
            size: 12,
            weight: '600',
            family: 'Inter, sans-serif',
          },
          color: '#334155',
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 25,
          backdropColor: 'transparent',
          color: '#64748B',
          font: { size: 10 },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12, family: 'Inter, sans-serif' },
          boxWidth: 14,
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw}%`,
        },
      },
    },
  };

  return (
    <div className="w-full h-80 flex flex-col items-center">
      {title && <h4 className="text-sm font-semibold text-slate-700 mb-2">{title}</h4>}
      <div className="w-full h-72">
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
}
