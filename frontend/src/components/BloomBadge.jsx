import React from 'react';

export const BLOOM_CONFIG = {
  REMEMBER: {
    label: 'Remember',
    bg: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    color: '#3B82F6',
    description: 'Recall facts and basic concepts: define, duplicate, list, memorize, repeat, state.',
  },
  UNDERSTAND: {
    label: 'Understand',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    color: '#10B981',
    description: 'Explain ideas or concepts: classify, describe, discuss, explain, identify, locate, recognize.',
  },
  APPLY: {
    label: 'Apply',
    bg: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    color: '#F59E0B',
    description: 'Use information in new situations: execute, implement, solve, use, demonstrate, interpret.',
  },
  ANALYZE: {
    label: 'Analyze',
    bg: 'bg-pink-100 text-pink-800 border-pink-200',
    dot: 'bg-pink-500',
    color: '#EC4899',
    description: 'Draw connections among ideas: differentiate, organize, relate, compare, contrast, examine.',
  },
  EVALUATE: {
    label: 'Evaluate',
    bg: 'bg-purple-100 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    color: '#8B5CF6',
    description: 'Justify a stand or decision: appraise, argue, defend, judge, select, support, value, critique.',
  },
  CREATE: {
    label: 'Create',
    bg: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    color: '#EF4444',
    description: 'Produce new or original work: design, assemble, construct, formulate, author, investigate.',
  },
};

export default function BloomBadge({ level, size = 'md', showDescription = false }) {
  const normalizedLevel = (level || 'UNDERSTAND').toUpperCase();
  const config = BLOOM_CONFIG[normalizedLevel] || BLOOM_CONFIG.UNDERSTAND;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <div className="inline-flex flex-col group relative">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bg} ${sizeClasses[size]}`}
        title={config.description}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
        {config.label}
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
          {config.description}
        </span>
      )}
    </div>
  );
}
