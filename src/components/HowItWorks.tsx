import React from 'react';
import { motion } from 'motion/react';
import { Code2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 border-b border-[#E8E2D6] scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-medium tracking-wider text-[#77776B]">
            <span>ALGORITHMIC PARADIGM</span>
            <span aria-hidden="true">·</span>
            <span>THREE-STAGE STRATEGY</span>
          </div>
          <h2
            className="font-serif text-3xl sm:text-4xl font-semibold text-[#252820] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            From Raw Readings to Real Results
          </h2>
          <p className="text-sm sm:text-base text-[#77776B]">
            Instead of scanning every element twice against a running minimum and maximum, Divide and Conquer pairs readings at the leaves and combines winners up the recursion tree.
          </p>
        </div>

        {/* Three Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Step 1: Divide */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35 }}
            className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="text-xs font-mono font-semibold text-[#E58A45]">
                01. STEP ONE
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#252820]">
                Divide
              </h3>
              <p className="text-sm text-[#77776B] leading-relaxed">
                Split the temperature readings into smaller ranges until each range contains one or two readings.
              </p>
            </div>

            {/* Visual Diagram: Array splitting */}
            <div className="p-4 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6] space-y-3">
              <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                <span className="px-2 py-1 rounded bg-[#FFFDF7] border border-[#E8E2D6] text-[#252820]">
                  18°
                </span>
                <span className="px-2 py-1 rounded bg-[#FFFDF7] border border-[#E8E2D6] text-[#252820]">
                  22°
                </span>
                <span className="px-2 py-1 rounded bg-[#FFFDF7] border border-[#E8E2D6] text-[#252820]">
                  12°
                </span>
                <span className="px-2 py-1 rounded bg-[#FFFDF7] border border-[#E8E2D6] text-[#252820]">
                  31°
                </span>
              </div>
              <div className="text-center font-mono text-[10px] text-[#77776B]">
                ↓ mid = ⌊(low + high) / 2⌋ ↓
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-1.5 rounded bg-[#FFFDF7] border border-[#4C91C7]/50 text-center text-[#252820]">
                  [18°, 22°]
                </div>
                <div className="p-1.5 rounded bg-[#FFFDF7] border border-[#E58A45]/50 text-center text-[#252820]">
                  [12°, 31°]
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Conquer */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="text-xs font-mono font-semibold text-[#E58A45]">
                02. STEP TWO
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#252820]">
                Conquer
              </h3>
              <p className="text-sm text-[#77776B] leading-relaxed">
                Find the minimum and maximum temperatures in each small range. A 1-element leaf needs 0 comparisons; a 2-element leaf needs only 1 comparison.
              </p>
            </div>

            {/* Visual Diagram: Leaf Base Cases */}
            <div className="p-4 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6] space-y-2.5 font-mono text-[11px]">
              <div className="p-2 rounded bg-[#FFFDF7] border border-[#E8E2D6] flex items-center justify-between">
                <span className="text-[#77776B]">Pair [18°, 22°]</span>
                <span>
                  <strong className="text-[#4C91C7]">18°</strong> /{' '}
                  <strong className="text-[#E46F55]">22°</strong> (1 comp)
                </span>
              </div>
              <div className="p-2 rounded bg-[#FFFDF7] border border-[#E8E2D6] flex items-center justify-between">
                <span className="text-[#77776B]">Pair [12°, 31°]</span>
                <span>
                  <strong className="text-[#4C91C7]">12°</strong> /{' '}
                  <strong className="text-[#E46F55]">31°</strong> (1 comp)
                </span>
              </div>
            </div>
          </motion.div>

          {/* Step 3: Combine */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, delay: 0.16 }}
            className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="text-xs font-mono font-semibold text-[#E58A45]">
                03. STEP THREE
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#252820]">
                Combine
              </h3>
              <p className="text-sm text-[#77776B] leading-relaxed">
                Compare the results from both halves to determine the overall minimum and maximum using exactly two comparisons per merge.
              </p>
            </div>

            {/* Visual Diagram: Combining Local Results */}
            <div className="p-4 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6] space-y-2.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#252820]">
                <span>Min(18°, 12°)</span>
                <span className="font-semibold text-[#4C91C7]">→ 12.0°C</span>
              </div>
              <div className="flex items-center justify-between text-[#252820]">
                <span>Max(22°, 31°)</span>
                <span className="font-semibold text-[#E46F55]">→ 31.0°C</span>
              </div>
              <div className="pt-2 border-t border-[#E8E2D6] text-center text-[10px] text-[#67866A] font-semibold">
                Total: 1 + 1 + 2 = 4 comparisons (vs 6 linear)
              </div>
            </div>
          </motion.div>
        </div>

        {/* Clean Algorithm Pseudocode Reference */}
        <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8E2D6]">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#E58A45]" />
              <h3 className="font-serif text-lg font-semibold text-[#252820]">
                Core Divide and Conquer Pseudocode
              </h3>
            </div>
            <span className="font-mono text-xs text-[#77776B]">
              Conceptual Signature: minMax(readings, low, high)
            </span>
          </div>

          <pre className="p-4 sm:p-5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6] font-mono text-xs sm:text-sm text-[#252820] overflow-x-auto leading-relaxed custom-scrollbar">
{`FUNCTION minMax(readings, low, high):
  // Base Case 1: Single reading (0 temperature comparisons)
  IF low == high:
      RETURN readings[low] as both minimum and maximum

  // Base Case 2: Two readings (1 temperature comparison)
  IF high == low + 1:
      INCREMENT comparison counter
      COMPARE readings[low].temperature and readings[high].temperature
      RETURN the smaller reading as minimum
      RETURN the larger reading as maximum

  // Recursive Case: Divide into two halves
  mid = floor((low + high) / 2)
  leftResult = minMax(readings, low, mid)
  rightResult = minMax(readings, mid + 1, high)

  // Combine Step: 2 temperature comparisons
  INCREMENT comparison counter
  Compare leftResult.minimum with rightResult.minimum

  INCREMENT comparison counter
  Compare leftResult.maximum with rightResult.maximum

  RETURN combined minimum and maximum`}
          </pre>
        </div>
      </div>
    </section>
  );
};
