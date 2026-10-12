import React from 'react';
import { motion } from 'motion/react';
import {
  Snowflake,
  Sun,
  CheckCircle2,
  GitBranch,
  ListOrdered,
  Clock,
  Layers,
} from 'lucide-react';
import {
  AnalyzedReading,
  MinMaxResult,
  formatDateLabel,
} from '../utils/temperatureAlgorithms';
import { ComparisonChart } from './ComparisonChart';
import { TemperatureChart } from './TemperatureChart';

interface ResultsSectionProps {
  analyzedReadings: AnalyzedReading[];
  totalUnfilteredCount: number;
  dacResult: MinMaxResult | null;
  linearResult: MinMaxResult | null;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  analyzedReadings,
  totalUnfilteredCount,
  dacResult,
  linearResult,
}) => {
  if (!dacResult || !linearResult || analyzedReadings.length === 0) {
    return null;
  }

  const methodsAgree =
    dacResult.minimum.id === linearResult.minimum.id &&
    dacResult.maximum.id === linearResult.maximum.id &&
    dacResult.minimum.temperature === linearResult.minimum.temperature &&
    dacResult.maximum.temperature === linearResult.maximum.temperature;

  const isFilteredSubset = analyzedReadings.length < totalUnfilteredCount;

  return (
    <section
      id="results"
      className="py-16 md:py-24 border-b border-[#E8E2D6] scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-medium tracking-wider text-[#77776B]">
            <span>COMPUTATION OUTPUT</span>
            <span aria-hidden="true">·</span>
            <span>DIVIDE &amp; CONQUER RESULTS</span>
          </div>
          <h2
            className="font-serif text-3xl sm:text-4xl font-semibold text-[#252820] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Identified Temperature Extremes
          </h2>
          <p className="text-sm sm:text-base text-[#77776B]">
            Exact minimum and maximum readings found by recursively dividing and combining{' '}
            <span className="font-mono font-semibold text-[#252820] tabular-nums">
              {analyzedReadings.length}
            </span>{' '}
            {analyzedReadings.length === 1 ? 'record' : 'records'}.
          </p>
        </div>

        {/* Two-Card Layout: Minimum & Maximum Temperature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Minimum Temperature Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-[#4C91C7]/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider text-[#4C91C7]">
                  COLDEST READING
                </p>
                <p className="text-xs text-[#77776B]">
                  Global Minimum Temperature
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#4C91C7]/12 flex items-center justify-center text-[#4C91C7] shrink-0">
                <Snowflake className="w-5 h-5" strokeWidth={1.8} />
              </div>
            </div>

            <div className="py-2">
              <p className="font-serif text-5xl sm:text-6xl font-semibold text-[#4C91C7] tracking-tight font-mono tabular-nums">
                {dacResult.minimum.temperature.toFixed(1)}°C
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8E2D6] flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
              <div>
                <span className="text-[#77776B] block text-xs">Recorded Date / Label</span>
                <span className="font-semibold text-[#252820]">
                  {formatDateLabel(dacResult.minimum.date)}
                </span>
              </div>

              <div className="text-right font-mono tabular-nums">
                <span className="text-[#77776B] block text-xs font-sans">Original Position</span>
                <span className="font-semibold text-[#252820]">
                  Position: {dacResult.minimum.originalPosition} of {totalUnfilteredCount}
                  {isFilteredSubset && (
                    <span className="text-xs text-[#77776B] font-normal ml-1">
                      (#{dacResult.minimum.filteredPosition} in range)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Maximum Temperature Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-[#E46F55]/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider text-[#E46F55]">
                  HOTTEST READING
                </p>
                <p className="text-xs text-[#77776B]">
                  Global Maximum Temperature
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#E46F55]/12 flex items-center justify-center text-[#E46F55] shrink-0">
                <Sun className="w-5 h-5" strokeWidth={1.8} />
              </div>
            </div>

            <div className="py-2">
              <p className="font-serif text-5xl sm:text-6xl font-semibold text-[#E46F55] tracking-tight font-mono tabular-nums">
                {dacResult.maximum.temperature.toFixed(1)}°C
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8E2D6] flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
              <div>
                <span className="text-[#77776B] block text-xs">Recorded Date / Label</span>
                <span className="font-semibold text-[#252820]">
                  {formatDateLabel(dacResult.maximum.date)}
                </span>
              </div>

              <div className="text-right font-mono tabular-nums">
                <span className="text-[#77776B] block text-xs font-sans">Original Position</span>
                <span className="font-semibold text-[#252820]">
                  Position: {dacResult.maximum.originalPosition} of {totalUnfilteredCount}
                  {isFilteredSubset && (
                    <span className="text-xs text-[#77776B] font-normal ml-1">
                      (#{dacResult.maximum.filteredPosition} in range)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analysis Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#77776B]">
              <span>Readings Analyzed</span>
              <Layers className="w-3.5 h-3.5 text-[#E58A45]" />
            </div>
            <p className="font-mono text-2xl font-semibold text-[#252820] tabular-nums">
              {analyzedReadings.length}
            </p>
            <p className="text-[11px] text-[#77776B]">
              {isFilteredSubset
                ? `Filtered from ${totalUnfilteredCount} total records`
                : 'Complete dataset analyzed'}
            </p>
          </div>

          <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#77776B]">
              <span>Divide &amp; Conquer</span>
              <GitBranch className="w-3.5 h-3.5 text-[#E58A45]" />
            </div>
            <p className="font-mono text-2xl font-semibold text-[#E58A45] tabular-nums">
              {dacResult.comparisons}
            </p>
            <p className="text-[11px] text-[#77776B]">
              Temperature comparisons
            </p>
          </div>

          <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#77776B]">
              <span>Linear Baseline</span>
              <ListOrdered className="w-3.5 h-3.5 text-[#77776B]" />
            </div>
            <p className="font-mono text-2xl font-semibold text-[#252820] tabular-nums">
              {linearResult.comparisons}
            </p>
            <p className="text-[11px] text-[#77776B]">
              2(n − 1) sequential comparisons
            </p>
          </div>

          <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#77776B]">
              <span>Time Complexity</span>
              <Clock className="w-3.5 h-3.5 text-[#E58A45]" />
            </div>
            <p className="font-mono text-2xl font-semibold text-[#252820] tabular-nums">
              O(n)
            </p>
            <p className="text-[11px] text-[#77776B]">
              O(log n) auxiliary stack depth
            </p>
          </div>

          <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#77776B]">
              <span>Method Agreement</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#67866A]" />
            </div>
            <p className="text-base font-semibold text-[#67866A] pt-1">
              {methodsAgree ? 'Identical Match' : 'Mismatch'}
            </p>
            <p className="text-[11px] text-[#77776B]">
              Both find {dacResult.minimum.temperature.toFixed(1)}°C &amp;{' '}
              {dacResult.maximum.temperature.toFixed(1)}°C
            </p>
          </div>
        </div>

        {/* Comparison Visualization */}
        <ComparisonChart
          divideAndConquerComparisons={dacResult.comparisons}
          linearComparisons={linearResult.comparisons}
          readingsCount={analyzedReadings.length}
        />

        {/* Temperature Line Chart */}
        <TemperatureChart
          readings={analyzedReadings}
          minimum={dacResult.minimum}
          maximum={dacResult.maximum}
        />
      </div>
    </section>
  );
};
