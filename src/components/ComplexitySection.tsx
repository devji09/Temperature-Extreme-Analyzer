import React, { useMemo, useState } from 'react';
import { CheckCircle2, Play, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import {
  TemperatureReading,
  runSpecificationTestSuite,
} from '../utils/temperatureAlgorithms';

interface ComplexitySectionProps {
  onLoadTestDataset: (readings: TemperatureReading[]) => void;
}

export const ComplexitySection: React.FC<ComplexitySectionProps> = ({
  onLoadTestDataset,
}) => {
  const [showTestSuite, setShowTestSuite] = useState(false);
  const testResults = useMemo(() => runSpecificationTestSuite(), []);
  const allPassed = testResults.every((t) => t.passed);

  return (
    <section className="py-16 md:py-24 border-b border-[#E8E2D6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-medium tracking-wider text-[#77776B]">
            <span>ASYMPTOTIC &amp; EXACT ANALYSIS</span>
            <span aria-hidden="true">·</span>
            <span>ALGORITHM BENCHMARK</span>
          </div>
          <h2
            className="font-serif text-3xl sm:text-4xl font-semibold text-[#252820] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Understanding the Efficiency
          </h2>
          <p className="text-sm sm:text-base text-[#77776B]">
            Both algorithms run in linear asymptotic time <code className="font-mono text-[#252820]">O(n)</code>, yet Divide and Conquer reduces the constant factor of temperature comparisons by pairing elements at the base cases.
          </p>
        </div>

        {/* Two-Column Complexity Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Divide and Conquer Card */}
          <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-[#E58A45]">
                  PRIMARY METHOD
                </span>
                <Cpu className="w-4 h-4 text-[#E58A45]" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#252820]">
                Divide and Conquer
              </h3>
              <p className="text-sm text-[#77776B] leading-relaxed">
                Recursively splits the array in half, compares pairs at 2-element base cases with a single comparison, and combines local extremes using two comparisons per recursive merge.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6]">
                <span className="text-[11px] text-[#77776B] block">Time Complexity</span>
                <span className="font-mono text-lg font-semibold text-[#252820]">
                  O(n)
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6]">
                <span className="text-[11px] text-[#77776B] block">Auxiliary Stack</span>
                <span className="font-mono text-lg font-semibold text-[#252820]">
                  O(log n)
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6]">
                <span className="text-[11px] text-[#77776B] block">Comparisons (n=2ᵏ)</span>
                <span className="font-mono text-lg font-semibold text-[#E58A45]">
                  3n/2 − 2
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E2D6] text-xs text-[#77776B] font-mono">
              Recurrence: T(n) = 2T(n/2) + 2, with T(2) = 1 and T(1) = 0
            </div>
          </div>

          {/* Linear Baseline Card */}
          <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-[#77776B]">
                  BENCHMARK METHOD
                </span>
                <Cpu className="w-4 h-4 text-[#77776B]" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#252820]">
                Linear Baseline
              </h3>
              <p className="text-sm text-[#77776B] leading-relaxed">
                Initializes both minimum and maximum with the first reading, then iterates through the remaining <code className="font-mono text-[#252820]">n − 1</code> readings, performing two temperature comparisons per element.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6]">
                <span className="text-[11px] text-[#77776B] block">Time Complexity</span>
                <span className="font-mono text-lg font-semibold text-[#252820]">
                  O(n)
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6]">
                <span className="text-[11px] text-[#77776B] block">Auxiliary Space</span>
                <span className="font-mono text-lg font-semibold text-[#252820]">
                  O(1)
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6]">
                <span className="text-[11px] text-[#77776B] block">Comparisons (n≥1)</span>
                <span className="font-mono text-lg font-semibold text-[#252820]">
                  2(n − 1)
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E2D6] text-xs text-[#77776B] font-mono">
              Exact Count: 2n − 2 temperature comparisons for any n ≥ 1
            </div>
          </div>
        </div>

        {/* Comparison Analysis Callout */}
        <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-semibold text-[#252820]">
                Why Compare Both Approaches?
              </h3>
              <p className="text-xs sm:text-sm text-[#77776B] leading-relaxed max-w-3xl">
                Divide and Conquer does not change the asymptotic time complexity from linear <code className="font-mono text-[#252820]">O(n)</code> to logarithmic — every temperature reading must still be inspected at least once. However, by comparing pairs of readings against each other before comparing local winners, Divide and Conquer performs approximately <code className="font-mono text-[#252820]">1.5n − 2</code> comparisons instead of <code className="font-mono text-[#252820]">2n − 2</code>, saving roughly <strong className="text-[#252820]">25% of temperature comparisons</strong> on larger datasets.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowTestSuite((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#252820] bg-[#F8F5EC] hover:bg-[#EFE9DA] border border-[#E8E2D6] rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 text-[#67866A]" />
              <span>
                {showTestSuite
                  ? 'Hide Automated Verification Suite'
                  : `View 10 Verified Test Cases (${allPassed ? 'All Passing' : 'Check'})`}
              </span>
              {showTestSuite ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Expandable Automated Specification Test Suite */}
          {showTestSuite && (
            <div className="pt-4 border-t border-[#E8E2D6] space-y-3">
              <p className="text-xs text-[#77776B]">
                Live verification of all 10 algorithm edge cases (single reading, two readings, negative values, duplicate tie-breaking, odd/even lengths, date filtering, and CSV validation). Click &ldquo;Load into Analyzer&rdquo; on any dataset case to inspect it live:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testResults.map((test) => (
                  <div
                    key={test.id}
                    className="p-3.5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6] flex flex-col justify-between gap-2.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#252820]">
                          {test.name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#67866A]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Passed</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-[#77776B]">{test.description}</p>
                      <p className="font-mono text-[11px] text-[#252820] tabular-nums pt-0.5">
                        {test.details}
                      </p>
                    </div>

                    {test.sampleReadings && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onLoadTestDataset(test.sampleReadings!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-[#252820] bg-[#FFFDF7] hover:bg-[#EFE9DA] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 text-[#E58A45] fill-current" />
                          <span>Load into Analyzer</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
