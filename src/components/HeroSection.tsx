import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, GitBranch, Snowflake, Sun } from 'lucide-react';
import { MinMaxResult, formatDateLabel } from '../utils/temperatureAlgorithms';

interface HeroSectionProps {
  currentResult: MinMaxResult | null;
  totalAnalyzed: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ currentResult, totalAnalyzed }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayMin = currentResult ? currentResult.minimum.temperature.toFixed(1) : '-6.8';
  const displayMinDate = currentResult ? formatDateLabel(currentResult.minimum.date) : 'January 5, 2026';
  const displayMax = currentResult ? currentResult.maximum.temperature.toFixed(1) : '34.8';
  const displayMaxDate = currentResult ? formatDateLabel(currentResult.maximum.date) : 'January 12, 2026';
  const displayComps = currentResult ? currentResult.comparisons : 22;
  const displayCount = totalAnalyzed > 0 ? totalAnalyzed : 16;

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#E8E2D6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Editorial Narrative & Primary Actions */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-[#77776B]">
              <span>MINI PROJECT</span>
              <span aria-hidden="true">·</span>
              <span>DIVIDE &amp; CONQUER</span>
              <span aria-hidden="true">·</span>
              <span>THERMOSCOPE</span>
            </div>

            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-[#252820] leading-[1.12] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Every Degree Tells a Story.
            </h1>

            <p className="text-base sm:text-lg text-[#77776B] leading-relaxed max-w-xl">
              Discover the hottest and coldest moments in your temperature records using the power of Divide and Conquer. Recursively partition daily observations, isolate local bounds, and verify exact comparison efficiency against a linear baseline.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('analyze')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium text-[#FFFDF7] bg-[#E58A45] hover:bg-[#d37935] rounded-xl transition-all duration-150 shadow-xs cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252820]"
              >
                <span>Start Analyzing</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('algorithm')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium text-[#252820] bg-[#FFFDF7] hover:bg-[#F2EDE1] border border-[#E8E2D6] rounded-xl transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E58A45]"
              >
                <GitBranch className="w-4 h-4 text-[#E58A45]" />
                <span>Explore the Algorithm</span>
              </button>
            </div>

            {/* Subtle unboxed summary metadata */}
            <div className="pt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#77776B]">
              <span className="font-mono tabular-nums text-[#252820] font-medium">
                O(n) Time Complexity
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                ⌈3n/2⌉ − 2 Comparisons
              </span>
              <span aria-hidden="true">·</span>
              <span>Interactive Recursion Tree</span>
            </div>
          </motion.div>

          {/* Right Column: Stylized Weather & Algorithm Graphic */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="relative bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 sm:p-8">
              {/* Top Header Row inside the visual frame */}
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#E8E2D6]">
                <div>
                  <p className="text-xs text-[#77776B]">Recursive Range Partitioning</p>
                  <p className="font-serif text-lg font-medium text-[#252820]">
                    Active Dataset Curve ({displayCount} Readings)
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-[#77776B] tabular-nums">
                  <span>minMax(0, {Math.max(0, displayCount - 1)})</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="text-[#252820] font-medium">{displayComps} comps</span>
                </div>
              </div>

              {/* SVG Illustration: Stylized Thermometer, Sun, Cloud, Curved Temperature Line & Floating Labels */}
              <div className="relative w-full aspect-[16/10] bg-[#F8F5EC]/70 rounded-xl border border-[#E8E2D6]/70 p-4 flex items-center justify-center overflow-hidden">
                <svg
                  viewBox="0 0 540 310"
                  className="w-full h-full select-none"
                  role="img"
                  aria-label="Stylized thermometer and temperature curve showing coldest and hottest extremes"
                >
                  <defs>
                    <linearGradient id="tempCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E58A45" />
                      <stop offset="35%" stopColor="#4C91C7" />
                      <stop offset="75%" stopColor="#E46F55" />
                      <stop offset="100%" stopColor="#E58A45" />
                    </linearGradient>
                    <linearGradient id="tempAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#E58A45" stopOpacity="0.16" />
                      <stop offset="50%" stopColor="#4C91C7" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#F8F5EC" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="thermometerStemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#4C91C7" />
                      <stop offset="50%" stopColor="#E58A45" />
                      <stop offset="100%" stopColor="#E46F55" />
                    </linearGradient>
                  </defs>

                  {/* Subtle horizontal reference lines */}
                  <line x1="30" y1="65" x2="430" y2="65" stroke="#E8E2D6" strokeDasharray="4 4" strokeWidth="1" />
                  <line x1="30" y1="155" x2="430" y2="155" stroke="#E8E2D6" strokeDasharray="4 4" strokeWidth="1" />
                  <line x1="30" y1="245" x2="430" y2="245" stroke="#E8E2D6" strokeDasharray="4 4" strokeWidth="1" />

                  {/* Recursive midpoint divider line */}
                  <line x1="230" y1="30" x2="230" y2="275" stroke="#77776B" strokeDasharray="3 5" strokeWidth="1.2" opacity="0.55" />
                  <text x="230" y="24" textAnchor="middle" fill="#77776B" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                    mid = ⌊(low + high) / 2⌋
                  </text>

                  {/* Minimal Sun Illustration (Top Right of Curve) */}
                  <g transform="translate(345, 42)">
                    <circle cx="0" cy="0" r="14" fill="#E58A45" fillOpacity="0.15" />
                    <circle cx="0" cy="0" r="8" fill="none" stroke="#E58A45" strokeWidth="1.75" />
                    <line x1="0" y1="-13" x2="0" y2="-16" stroke="#E58A45" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="0" y1="13" x2="0" y2="16" stroke="#E58A45" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="-13" y1="0" x2="-16" y2="0" stroke="#E58A45" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="13" y1="0" x2="16" y2="0" stroke="#E58A45" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="-9" y1="-9" x2="-11.5" y2="-11.5" stroke="#E58A45" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="9" y1="-9" x2="11.5" y2="-11.5" stroke="#E58A45" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="-9" y1="9" x2="-11.5" y2="11.5" stroke="#E58A45" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="9" y1="9" x2="11.5" y2="11.5" stroke="#E58A45" strokeWidth="1.5" strokeLinecap="round" />
                  </g>

                  {/* Minimal Cloud Illustration (Left Half) */}
                  <g transform="translate(88, 72)" fill="none" stroke="#77776B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65">
                    <path d="M10 18 H32 A8 8 0 0 0 33 2 A11 11 0 0 0 12 0 A9 9 0 0 0 10 18 Z" fill="#FFFDF7" />
                  </g>

                  {/* Area under the temperature curve */}
                  <path
                    d="M 40 140 C 85 160, 125 245, 165 245 C 205 245, 240 165, 275 115 C 305 70, 325 65, 345 65 C 375 65, 400 130, 425 150 L 425 275 L 40 275 Z"
                    fill="url(#tempAreaGrad)"
                  />

                  {/* Smooth Curved Temperature Line */}
                  <path
                    d="M 40 140 C 85 160, 125 245, 165 245 C 205 245, 240 165, 275 115 C 305 70, 325 65, 345 65 C 375 65, 400 130, 425 150"
                    fill="none"
                    stroke="url(#tempCurveGrad)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Intermediate sample points */}
                  <circle cx="40" cy="140" r="4" fill="#FFFDF7" stroke="#E58A45" strokeWidth="2" />
                  <circle cx="105" cy="198" r="3.5" fill="#FFFDF7" stroke="#4C91C7" strokeWidth="2" />
                  <circle cx="230" cy="175" r="4" fill="#FFFDF7" stroke="#252820" strokeWidth="2" />
                  <circle cx="285" cy="102" r="3.5" fill="#FFFDF7" stroke="#E58A45" strokeWidth="2" />
                  <circle cx="425" cy="150" r="4" fill="#FFFDF7" stroke="#E58A45" strokeWidth="2" />

                  {/* Coldest Point Marker & Floating Label */}
                  <g transform="translate(165, 245)">
                    <circle cx="0" cy="0" r="11" fill="#4C91C7" fillOpacity="0.18" />
                    <circle cx="0" cy="0" r="5.5" fill="#4C91C7" stroke="#FFFDF7" strokeWidth="2" />
                    <g transform="translate(-58, -46)">
                      <rect x="0" y="0" width="116" height="32" rx="6" fill="#FFFDF7" stroke="#4C91C7" strokeWidth="1.2" />
                      <text x="58" y="13" textAnchor="middle" fill="#77776B" fontSize="8.5" fontFamily="DM Sans, sans-serif">
                        GLOBAL MINIMUM
                      </text>
                      <text x="58" y="25" textAnchor="middle" fill="#4C91C7" fontSize="11" fontWeight="600" fontFamily="IBM Plex Mono, monospace">
                        {displayMin}°C
                      </text>
                    </g>
                  </g>

                  {/* Hottest Point Marker & Floating Label */}
                  <g transform="translate(345, 65)">
                    <circle cx="0" cy="0" r="11" fill="#E46F55" fillOpacity="0.18" />
                    <circle cx="0" cy="0" r="5.5" fill="#E46F55" stroke="#FFFDF7" strokeWidth="2" />
                    <g transform="translate(-58, 14)">
                      <rect x="0" y="0" width="116" height="32" rx="6" fill="#FFFDF7" stroke="#E46F55" strokeWidth="1.2" />
                      <text x="58" y="13" textAnchor="middle" fill="#77776B" fontSize="8.5" fontFamily="DM Sans, sans-serif">
                        GLOBAL MAXIMUM
                      </text>
                      <text x="58" y="25" textAnchor="middle" fill="#E46F55" fontSize="11" fontWeight="600" fontFamily="IBM Plex Mono, monospace">
                        {displayMax}°C
                      </text>
                    </g>
                  </g>

                  {/* Stylized Thermometer on the Right Side */}
                  <g transform="translate(478, 35)">
                    {/* Outer Glass Tube */}
                    <rect x="-12" y="0" width="24" height="195" rx="12" fill="#FFFDF7" stroke="#252820" strokeWidth="1.6" />
                    {/* Bulb */}
                    <circle cx="0" cy="208" r="22" fill="#FFFDF7" stroke="#252820" strokeWidth="1.6" />
                    {/* Tick marks */}
                    <line x1="-20" y1="25" x2="-15" y2="25" stroke="#77776B" strokeWidth="1.2" />
                    <line x1="-18" y1="55" x2="-15" y2="55" stroke="#77776B" strokeWidth="1.2" />
                    <line x1="-20" y1="85" x2="-15" y2="85" stroke="#77776B" strokeWidth="1.2" />
                    <line x1="-18" y1="115" x2="-15" y2="115" stroke="#77776B" strokeWidth="1.2" />
                    <line x1="-20" y1="145" x2="-15" y2="145" stroke="#77776B" strokeWidth="1.2" />
                    <line x1="-18" y1="175" x2="-15" y2="175" stroke="#77776B" strokeWidth="1.2" />
                    {/* Mercury column */}
                    <rect x="-5" y="32" width="10" height="172" rx="5" fill="url(#thermometerStemGrad)" />
                    <circle cx="0" cy="208" r="14" fill="#4C91C7" />
                    <circle cx="-4" cy="204" r="3.5" fill="#FFFDF7" opacity="0.55" />
                  </g>
                </svg>
              </div>

              {/* Bottom Summary Strip showing sample/live Minimum & Maximum Temperatures */}
              <div className="mt-6 pt-5 border-t border-[#E8E2D6] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#4C91C7]/12 flex items-center justify-center text-[#4C91C7] shrink-0">
                      <Snowflake className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-[#77776B] tracking-wide">
                        COLDEST EXTREME
                      </p>
                      <p className="text-xs text-[#252820] font-medium">{displayMinDate}</p>
                    </div>
                  </div>
                  <span className="font-mono text-lg font-semibold text-[#4C91C7] tabular-nums">
                    {displayMin}°C
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#E46F55]/12 flex items-center justify-center text-[#E46F55] shrink-0">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-[#77776B] tracking-wide">
                        HOTTEST EXTREME
                      </p>
                      <p className="text-xs text-[#252820] font-medium">{displayMaxDate}</p>
                    </div>
                  </div>
                  <span className="font-mono text-lg font-semibold text-[#E46F55] tabular-nums">
                    {displayMax}°C
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
