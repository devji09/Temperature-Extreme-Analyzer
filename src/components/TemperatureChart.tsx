import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import {
  AnalyzedReading,
  formatDateLabel,
  formatShortDateLabel,
} from '../utils/temperatureAlgorithms';

interface TemperatureChartProps {
  readings: AnalyzedReading[];
  minimum: AnalyzedReading;
  maximum: AnalyzedReading;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: {
    id: string;
    temperature: number;
    isMin: boolean;
    isMax: boolean;
  };
}

const CustomTemperatureDot: React.FC<CustomDotProps> = ({ cx, cy, payload }) => {
  if (cx === undefined || cy === undefined || !payload) return null;

  if (payload.isMin && payload.isMax) {
    // Single element or all equal
    return (
      <g>
        <circle cx={cx} cy={cy} r={9} fill="#E58A45" fillOpacity={0.22} />
        <circle cx={cx} cy={cy} r={5.5} fill="#E58A45" stroke="#FFFDF7" strokeWidth={2} />
      </g>
    );
  }

  if (payload.isMin) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill="#4C91C7" fillOpacity={0.22} />
        <circle cx={cx} cy={cy} r={6} fill="#4C91C7" stroke="#FFFDF7" strokeWidth={2} />
      </g>
    );
  }

  if (payload.isMax) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill="#E46F55" fillOpacity={0.22} />
        <circle cx={cx} cy={cy} r={6} fill="#E46F55" stroke="#FFFDF7" strokeWidth={2} />
      </g>
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill="#FFFDF7"
      stroke="#E58A45"
      strokeWidth={2}
    />
  );
};

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  readings,
  minimum,
  maximum,
}) => {
  const chartData = readings.map((r) => ({
    ...r,
    shortLabel: formatShortDateLabel(r.date),
    fullLabel: formatDateLabel(r.date),
    isMin: r.id === minimum.id,
    isMax: r.id === maximum.id,
  }));

  const temps = readings.map((r) => r.temperature);
  const minVal = Math.min(...temps);
  const maxVal = Math.max(...temps);
  const padding = Math.max(3, Math.round((maxVal - minVal) * 0.15));
  const yDomain: [number, number] = [
    Math.floor(minVal - padding),
    Math.ceil(maxVal + padding),
  ];

  return (
    <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-6 sm:p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2D6] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#E58A45]" />
            <h3 className="font-serif text-xl font-semibold text-[#252820]">
              Temperature Readings Curve
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#77776B]">
            Visual distribution of the {readings.length} analyzed readings with highlighted minimum and maximum extremes.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#77776B]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#4C91C7] inline-block" />
            <span>Minimum ({minimum.temperature.toFixed(1)}°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#E46F55] inline-block" />
            <span>Maximum ({maximum.temperature.toFixed(1)}°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#E58A45] inline-block" />
            <span>Daily Reading (°C)</span>
          </div>
        </div>
      </div>

      {/* Recharts LineChart Container */}
      <div className="w-full h-[320px] sm:h-[360px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 16, right: 24, left: 4, bottom: 12 }}
          >
            <CartesianGrid
              stroke="#E8E2D6"
              strokeDasharray="3 3"
              vertical={false}
              opacity={0.65}
            />
            <XAxis
              dataKey="shortLabel"
              tick={{ fill: '#77776B', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}
              axisLine={{ stroke: '#E8E2D6' }}
              tickLine={{ stroke: '#E8E2D6' }}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              domain={yDomain}
              tickFormatter={(val) => `${val}°C`}
              tick={{ fill: '#77776B', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}
              axisLine={{ stroke: '#E8E2D6' }}
              tickLine={{ stroke: '#E8E2D6' }}
              width={52}
            />
            {minVal < 0 && maxVal > 0 && (
              <ReferenceLine
                y={0}
                stroke="#77776B"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{
                  value: '0°C Freezing',
                  position: 'insideBottomRight',
                  fill: '#77776B',
                  fontSize: 10,
                }}
              />
            )}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload as (typeof chartData)[number];
                return (
                  <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-xl p-3.5 shadow-sm text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-[#252820]">{data.fullLabel}</span>
                      <span className="font-mono text-[11px] text-[#77776B]">
                        Pos #{data.originalPosition}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span
                        className={`font-mono text-base font-semibold tabular-nums ${
                          data.isMin
                            ? 'text-[#4C91C7]'
                            : data.isMax
                            ? 'text-[#E46F55]'
                            : 'text-[#252820]'
                        }`}
                      >
                        {data.temperature.toFixed(1)}°C
                      </span>
                      {data.isMin && (
                        <span className="text-[11px] font-medium text-[#4C91C7]">
                          · Coldest Reading
                        </span>
                      )}
                      {data.isMax && !data.isMin && (
                        <span className="text-[11px] font-medium text-[#E46F55]">
                          · Hottest Reading
                        </span>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#E58A45"
              strokeWidth={2.5}
              dot={<CustomTemperatureDot />}
              activeDot={{
                r: 6,
                fill: '#E58A45',
                stroke: '#FFFDF7',
                strokeWidth: 2,
              }}
              isAnimationActive={true}
              animationDuration={450}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
