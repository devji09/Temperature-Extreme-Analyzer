import React, { useState } from 'react';
import { Trash2, Plus, RotateCcw, AlertCircle } from 'lucide-react';
import { TemperatureReading, formatDateLabel } from '../utils/temperatureAlgorithms';

interface ReadingTableProps {
  readings: TemperatureReading[];
  includedIds: Set<string>;
  onAddReading: (date: string, temperature: number) => void;
  onUpdateReading: (id: string, field: 'date' | 'temperature', value: string) => void;
  onDeleteReading: (id: string) => void;
  onClearAll: () => void;
}

export const ReadingTable: React.FC<ReadingTableProps> = ({
  readings,
  includedIds,
  onAddReading,
  onUpdateReading,
  onDeleteReading,
  onClearAll,
}) => {
  const [newDate, setNewDate] = useState('2026-01-17');
  const [newTemp, setNewTemp] = useState('');
  const [entryError, setEntryError] = useState<string | null>(null);
  const [rawTempEdits, setRawTempEdits] = useState<Record<string, string>>({});

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEntryError(null);

    const trimmedDate = newDate.trim();
    if (!trimmedDate) {
      setEntryError('Please enter a date (e.g., 2026-01-17) or day label (e.g., Day 1).');
      return;
    }

    const cleanedTemp = newTemp.trim().replace(/°?[cC]$/, '');
    if (cleanedTemp === '') {
      setEntryError('Please enter a temperature value in degrees Celsius.');
      return;
    }

    const parsedTemp = Number(cleanedTemp);
    if (!Number.isFinite(parsedTemp)) {
      setEntryError('Temperature must be a valid finite number (decimals and negatives are supported).');
      return;
    }

    if (parsedTemp < -100 || parsedTemp > 100) {
      setEntryError('Please enter a realistic temperature between -100°C and 100°C.');
      return;
    }

    onAddReading(trimmedDate, Math.round(parsedTemp * 100) / 100);
    setNewTemp('');

    // Auto-increment ISO date by 1 day for convenience if applicable
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      const dt = new Date(`${trimmedDate}T00:00:00Z`);
      if (!Number.isNaN(dt.getTime())) {
        dt.setUTCDate(dt.getUTCDate() + 1);
        setNewDate(dt.toISOString().slice(0, 10));
      }
    } else if (/^Day\s+(\d+)$/i.test(trimmedDate)) {
      const match = trimmedDate.match(/^Day\s+(\d+)$/i);
      if (match) {
        setNewDate(`Day ${Number(match[1]) + 1}`);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Manual Add Reading Form */}
      <form
        onSubmit={handleAddSubmit}
        className="p-4 sm:p-5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6] space-y-3"
        noValidate
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#252820]">
            Add Daily Temperature Reading
          </h3>
          <span className="text-xs text-[#77776B]">
            Supports negative &amp; decimal values (°C)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label
              htmlFor="new-reading-date"
              className="block text-xs font-medium text-[#77776B] mb-1.5"
            >
              Date or Day Label
            </label>
            <input
              id="new-reading-date"
              type="text"
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value);
                if (entryError) setEntryError(null);
              }}
              placeholder="2026-01-17 or Day 1"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF7] border border-[#E8E2D6] rounded-lg text-[#252820] placeholder:text-[#77776B]/60 focus:outline-none focus:border-[#E58A45] font-mono tabular-nums"
            />
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="new-reading-temp"
              className="block text-xs font-medium text-[#77776B] mb-1.5"
            >
              Temperature (°C)
            </label>
            <div className="relative">
              <input
                id="new-reading-temp"
                type="number"
                step="0.1"
                value={newTemp}
                onChange={(e) => {
                  setNewTemp(e.target.value);
                  if (entryError) setEntryError(null);
                }}
                placeholder="e.g. 18.5 or -4.2"
                className="w-full pl-3.5 pr-9 py-2.5 text-sm bg-[#FFFDF7] border border-[#E8E2D6] rounded-lg text-[#252820] placeholder:text-[#77776B]/60 focus:outline-none focus:border-[#E58A45] font-mono tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#77776B] pointer-events-none">
                °C
              </span>
            </div>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#FFFDF7] bg-[#252820] hover:bg-[#3A3E33] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E58A45]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reading</span>
            </button>
          </div>
        </div>

        {entryError && (
          <div
            role="alert"
            className="flex items-center gap-2 text-xs text-[#E46F55] pt-1"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{entryError}</span>
          </div>
        )}
      </form>

      {/* Table Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 text-xs text-[#77776B]">
          <span className="font-semibold text-[#252820] font-mono tabular-nums">
            {readings.length} {readings.length === 1 ? 'Record' : 'Records'} Total
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {includedIds.size} in Active Analysis Range
          </span>
        </div>

        {readings.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#77776B] hover:text-[#E46F55] bg-[#F8F5EC] hover:bg-[#E46F55]/10 border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All Readings</span>
          </button>
        )}
      </div>

      {/* Editable Table */}
      {readings.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-xl bg-[#F8F5EC]/60 border border-dashed border-[#E8E2D6] space-y-2">
          <p className="text-sm font-medium text-[#252820]">
            No temperature readings in the dataset yet.
          </p>
          <p className="text-xs text-[#77776B] max-w-md mx-auto">
            Add a daily reading above, click &ldquo;Load Sample Data&rdquo; to populate a 16-day demonstration dataset, or import a two-column CSV file.
          </p>
        </div>
      ) : (
        <div className="border border-[#E8E2D6] rounded-xl overflow-hidden bg-[#FFFDF7]">
          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F8F5EC] border-b border-[#E8E2D6] text-[11px] font-semibold text-[#77776B] tracking-wider uppercase">
                <tr>
                  <th className="py-3 pl-4 pr-2 w-16"># Pos</th>
                  <th className="py-3 px-3">Date / Day Label</th>
                  <th className="py-3 px-3 hidden sm:table-cell">Formatted Date</th>
                  <th className="py-3 px-3 text-right w-40">Temperature (°C)</th>
                  <th className="py-3 pl-2 pr-4 text-right w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D6]/70 text-sm">
                {readings.map((reading, index) => {
                  const isIncluded = includedIds.has(reading.id);
                  const tempDisplayValue =
                    rawTempEdits[reading.id] !== undefined
                      ? rawTempEdits[reading.id]
                      : String(reading.temperature);

                  return (
                    <tr
                      key={reading.id}
                      className={`transition-colors ${
                        isIncluded
                          ? 'bg-[#FFFDF7] hover:bg-[#F8F5EC]/60'
                          : 'bg-[#F8F5EC]/40 opacity-55'
                      }`}
                    >
                      <td className="py-2.5 pl-4 pr-2 font-mono text-xs text-[#77776B] tabular-nums">
                        #{index + 1}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          aria-label={`Date or label for record ${index + 1}`}
                          value={reading.date}
                          onChange={(e) => onUpdateReading(reading.id, 'date', e.target.value)}
                          className="w-full max-w-[160px] px-2.5 py-1 text-xs sm:text-sm font-mono tabular-nums text-[#252820] bg-transparent hover:bg-[#F8F5EC] focus:bg-[#FFFDF7] border border-transparent hover:border-[#E8E2D6] focus:border-[#E58A45] rounded-md focus:outline-none transition-colors"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[#77776B] hidden sm:table-cell">
                        {formatDateLabel(reading.date)}
                        {!isIncluded && (
                          <span className="ml-2 text-[11px] text-[#E58A45]">
                            (Filtered out)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.1"
                            aria-label={`Temperature in Celsius for record ${index + 1}`}
                            value={tempDisplayValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRawTempEdits((prev) => ({ ...prev, [reading.id]: val }));
                              onUpdateReading(reading.id, 'temperature', val);
                            }}
                            onBlur={() => {
                              setRawTempEdits((prev) => {
                                const next = { ...prev };
                                delete next[reading.id];
                                return next;
                              });
                            }}
                            className={`w-24 px-2.5 py-1 text-right text-xs sm:text-sm font-mono tabular-nums font-medium bg-transparent hover:bg-[#F8F5EC] focus:bg-[#FFFDF7] border border-transparent hover:border-[#E8E2D6] focus:border-[#E58A45] rounded-md focus:outline-none transition-colors ${
                              reading.temperature < 0
                                ? 'text-[#4C91C7]'
                                : reading.temperature >= 30
                                ? 'text-[#E46F55]'
                                : 'text-[#252820]'
                            }`}
                          />
                          <span className="text-xs font-mono text-[#77776B]">°C</span>
                        </div>
                      </td>
                      <td className="py-2 pl-2 pr-4 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteReading(reading.id)}
                          aria-label={`Delete record ${index + 1} (${reading.date})`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#77776B] hover:text-[#E46F55] hover:bg-[#E46F55]/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
