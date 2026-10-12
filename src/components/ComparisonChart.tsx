import React from 'react';
import { motion } from 'motion/react';
import { Scale } from 'lucide-react';

interface ComparisonChartProps {
  divideAndConquerComparisons: number;
  linearComparisons: number;
  readingsCount: number;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  divideAndConquerComparisons,
  linearComparisons,
  readingsCount,
}) => {
  const maxVal = Math.max(divideAndConquerComparisons, linearComparisons, 1);
  const dacPercent =
    divideAndConquerComparisons === 0
      ? 0
      : Math.max(6, Math.round((divideAndConquerComparisons / maxVal) * 100));
  const linearPercent =
    linearComparisons === 0
      ? 0
      : Math.max(6, Math.round((linearComparisons / maxVal) * 100));

  const difference = linearComparisons - divideAndConquerComparisons;
  const savingsPercentage =
    linearComparisons > 0
      ? Math.round(((linearComparisons - divideAndConquerComparisons) / linearComparisons) * 100)
      : 0;

  return (
    <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 sm:p-7 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8E2D6] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#E58A45]" />
            <h3 className="font-serif text-xl font-semibold text-[#252820]">
              Temperature Comparison Count Analysis
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#77776B]">
            Measuring actual temperature-to-temperature comparisons performed across {readingsCount}{' '}
            {readingsCount === 1 ? 'reading' : 'readings'}.
          </p>
        </div>

        <div className="text-right font-mono text-xs tabular-nums">
          {difference > 0 ? (
            <span className="text-[#67866A] font-semibold">
              {difference} fewer {difference === 1 ? 'comparison' : 'comparisons'} ({savingsPercentage}% reduction)
            </span>
          ) : difference === 0 ? (
            <span className="text-[#77776B] font-medium">
              Equal comparison count (0 difference)
            </span>
          ) : (
            <span className="text-[#E58A45] font-medium">
              {Math.abs(difference)} more comparisons on this input size
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Comparison Bars */}
      <div className="space-y-5">
        {/* Bar 1: Divide and Conquer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#252820]">1. Divide and Conquer</span>
              <span className="text-[#77776B] text-xs hidden sm:inline">
                (Recursive pair &amp; tournament combination)
              </span>
            </div>
            <span className="font-mono font-semibold text-[#252820] tabular-nums">
              {divideAndConquerComparisons}{' '}
              {divideAndConquerComparisons === 1 ? 'comparison' : 'comparisons'}
            </span>
          </div>

          <div className="w-full h-8 bg-[#F8F5EC] border border-[#E8E2D6] rounded-lg overflow-hidden p-1 flex items-center">
            {divideAndConquerComparisons === 0 ? (
              <span className="px-2 text-[11px] font-mono text-[#77776B]">
                0 comparisons (Single-element base case)
              </span>
            ) : (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: `${dacPercent}%`, transformOrigin: 'left' }}
                className="h-full bg-[#E58A45] rounded-md flex items-center justify-end pr-2.5"
              >
                <span className="font-mono text-[11px] font-semibold text-[#FFFDF7] tabular-nums">
                  {divideAndConquerComparisons}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bar 2: Linear Baseline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#252820]">2. Linear Baseline</span>
              <span className="text-[#77776B] text-xs hidden sm:inline">
                (Sequential scan: 2(n − 1) comparisons)
              </span>
            </div>
            <span className="font-mono font-semibold text-[#77776B] tabular-nums">
              {linearComparisons} {linearComparisons === 1 ? 'comparison' : 'comparisons'}
            </span>
          </div>

          <div className="w-full h-8 bg-[#F8F5EC] border border-[#E8E2D6] rounded-lg overflow-hidden p-1 flex items-center">
            {linearComparisons === 0 ? (
              <span className="px-2 text-[11px] font-mono text-[#77776B]">
                0 comparisons (Single-element input)
              </span>
            ) : (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.45, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: `${linearPercent}%`, transformOrigin: 'left' }}
                className="h-full bg-[#252820] rounded-md flex items-center justify-end pr-2.5"
              >
                <span className="font-mono text-[11px] font-semibold text-[#FFFDF7] tabular-nums">
                  {linearComparisons}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Accurate Contextual Explanation */}
      <div className="pt-3 border-t border-[#E8E2D6] text-xs text-[#77776B] leading-relaxed">
        {readingsCount === 1 ? (
          <p>
            For <strong className="text-[#252820] font-mono">n = 1</strong>, both Divide and Conquer and the Linear Baseline immediately return the single reading as both the minimum and maximum, performing <strong className="text-[#252820] font-mono">0</strong> temperature comparisons.
          </p>
        ) : difference > 0 ? (
          <p>
            For <strong className="text-[#252820] font-mono">n = {readingsCount}</strong> readings, the two-comparison-per-element Linear Baseline performs <strong className="text-[#252820] font-mono">2({readingsCount} − 1) = {linearComparisons}</strong> comparisons, whereas recursive Divide and Conquer performs <strong className="text-[#252820] font-mono">{divideAndConquerComparisons}</strong> comparisons — saving <strong className="text-[#67866A] font-mono">{difference}</strong> temperature {difference === 1 ? 'comparison' : 'comparisons'} by comparing pairs at the leaves before combining local winners.
          </p>
        ) : (
          <p>
            Both methods performed <strong className="text-[#252820] font-mono">{divideAndConquerComparisons}</strong> comparisons on this dataset. Comparison counts depend on input size <strong className="text-[#252820] font-mono">n</strong> and how odd-sized subproblems split into 1-element and 2-element base cases.
          </p>
        )}
      </div>
    </div>
  );
};
