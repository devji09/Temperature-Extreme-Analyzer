import React from 'react';
import { BookOpen } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="py-16 md:py-24 border-b border-[#E8E2D6] scroll-mt-16"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-11 h-11 rounded-xl bg-[#E58A45]/12 text-[#E58A45] flex items-center justify-center mx-auto">
            <BookOpen className="w-5 h-5" strokeWidth={1.8} />
          </div>

          <h2
            className="font-serif text-3xl sm:text-4xl font-semibold text-[#252820] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Built on a Smarter Way to Compare
          </h2>

          <p className="text-sm sm:text-base text-[#77776B] leading-relaxed max-w-2xl mx-auto">
            Temperature Extremes Analyzer is a mini project that demonstrates the Divide and Conquer technique by finding the minimum and maximum temperature readings within a selected period. It also compares the number of temperature comparisons against a straightforward linear approach.
          </p>

          {/* Clean unboxed editorial metadata tags per Zero-Pill constitution */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-[#252820]">
            <span>Data Structures &amp; Algorithms</span>
            <span className="text-[#E58A45]" aria-hidden="true">·</span>
            <span>Divide and Conquer</span>
            <span className="text-[#E58A45]" aria-hidden="true">·</span>
            <span>Algorithm Analysis</span>
          </div>

          <div className="pt-4 border-t border-[#E8E2D6]">
            <p className="text-xs text-[#77776B] italic">
              Designed as an educational demonstration of recursive problem-solving.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
