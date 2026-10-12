import React from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { TemperatureReading, isISODateString } from '../utils/temperatureAlgorithms';

interface DateRangeFilterProps {
  readings: TemperatureReading[];
  startDateInput: string;
  endDateInput: string;
  appliedStartDate: string;
  appliedEndDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onApplyDateRange: () => void;
  onResetDateRange: () => void;
  rangeError: string | null;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  readings,
  startDateInput,
  endDateInput,
  appliedStartDate,
  appliedEndDate,
  onStartDateChange,
  onEndDateChange,
  onApplyDateRange,
  onResetDateRange,
  rangeError,
}) => {
  const allAreISO = readings.length > 0 && readings.every((r) => isISODateString(r.date));
  const hasActiveFilter = Boolean(appliedStartDate.trim() || appliedEndDate.trim());

  const firstLabel = readings.length > 0 ? readings[0].date : '2026-01-01';
  const lastLabel = readings.length > 0 ? readings[readings.length - 1].date : '2026-01-16';

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#E58A45]" />
          <h3 className="text-sm font-semibold text-[#252820]">
            Date or Label Range Selection
          </h3>
        </div>
        <span className="text-xs text-[#77776B]">
          {hasActiveFilter ? (
            <span className="text-[#67866A] font-medium">
              Active Filter: {appliedStartDate || 'Start'} → {appliedEndDate || 'End'}
            </span>
          ) : (
            <span>Analyzing all {readings.length} readings (inclusive)</span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-4">
          <label
            htmlFor="filter-start-date"
            className="block text-xs font-medium text-[#77776B] mb-1.5"
          >
            Start {allAreISO ? 'Date' : 'Date / Label'}
          </label>
          <input
            id="filter-start-date"
            type={allAreISO ? 'date' : 'text'}
            list={!allAreISO ? 'reading-labels-list' : undefined}
            value={startDateInput}
            onChange={(e) => onStartDateChange(e.target.value)}
            placeholder={firstLabel}
            className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#E8E2D6] rounded-lg text-[#252820] font-mono tabular-nums focus:outline-none focus:border-[#E58A45]"
          />
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="filter-end-date"
            className="block text-xs font-medium text-[#77776B] mb-1.5"
          >
            End {allAreISO ? 'Date' : 'Date / Label'}
          </label>
          <input
            id="filter-end-date"
            type={allAreISO ? 'date' : 'text'}
            list={!allAreISO ? 'reading-labels-list' : undefined}
            value={endDateInput}
            onChange={(e) => onEndDateChange(e.target.value)}
            placeholder={lastLabel}
            className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#E8E2D6] rounded-lg text-[#252820] font-mono tabular-nums focus:outline-none focus:border-[#E58A45]"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onApplyDateRange}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#252820] bg-[#FFFDF7] hover:bg-[#F2EDE1] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#E58A45]"
          >
            <Check className="w-4 h-4 text-[#67866A]" />
            <span>Apply Date Range</span>
          </button>

          {(startDateInput || endDateInput || hasActiveFilter) && (
            <button
              type="button"
              onClick={onResetDateRange}
              title="Clear Date Filter"
              aria-label="Clear Date Range Filter"
              className="inline-flex items-center justify-center px-2.5 py-2 text-xs font-medium text-[#77776B] hover:text-[#252820] bg-[#FFFDF7] hover:bg-[#F2EDE1] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Datalist for custom non-ISO day labels */}
      {!allAreISO && readings.length > 0 && (
        <datalist id="reading-labels-list">
          {readings.map((r) => (
            <option key={r.id} value={r.date} />
          ))}
        </datalist>
      )}

      {rangeError && (
        <p role="alert" className="text-xs text-[#E46F55] font-medium pt-1">
          {rangeError}
        </p>
      )}
    </div>
  );
};
