import React from 'react';
import { ThermometerSun, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#F8F5EC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-[#252820]">
            <ThermometerSun className="w-5 h-5 text-[#E58A45]" strokeWidth={1.8} />
            <span className="font-serif text-lg font-semibold tracking-tight">
              ThermoScope
            </span>
          </div>
          <span className="hidden sm:inline text-[#77776B]" aria-hidden="true">
            ·
          </span>
          <span className="text-xs sm:text-sm text-[#77776B]">
            Temperature Extremes Analyzer — Built for learning. Powered by algorithms.
          </span>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#252820] bg-[#FFFDF7] hover:bg-[#EFE9DA] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#E58A45]"
        >
          <span>Back to top</span>
          <ArrowUp className="w-3.5 h-3.5 text-[#E58A45]" />
        </button>
      </div>
    </footer>
  );
};
