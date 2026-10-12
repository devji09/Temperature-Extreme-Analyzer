import React, { useRef, useState } from 'react';
import {
  Database,
  Upload,
  Play,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  PenLine,
} from 'lucide-react';
import {
  TemperatureReading,
  DEFAULT_SAMPLE_READINGS,
  ODD_SAMPLE_READINGS,
  parseTemperatureCSV,
} from '../utils/temperatureAlgorithms';
import { ReadingTable } from './ReadingTable';
import { DateRangeFilter } from './DateRangeFilter';

interface TemperatureInputProps {
  readings: TemperatureReading[];
  includedIds: Set<string>;
  startDateInput: string;
  endDateInput: string;
  appliedStartDate: string;
  appliedEndDate: string;
  rangeError: string | null;
  validationError: string | null;
  isAnalyzing: boolean;
  onSetReadings: (readings: TemperatureReading[], resetRange?: boolean) => void;
  onAddReading: (date: string, temperature: number) => void;
  onUpdateReading: (id: string, field: 'date' | 'temperature', value: string) => void;
  onDeleteReading: (id: string) => void;
  onClearAll: () => void;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onApplyDateRange: () => void;
  onResetDateRange: () => void;
  onAnalyze: () => void;
}

export const TemperatureInput: React.FC<TemperatureInputProps> = ({
  readings,
  includedIds,
  startDateInput,
  endDateInput,
  appliedStartDate,
  appliedEndDate,
  rangeError,
  validationError,
  isAnalyzing,
  onSetReadings,
  onAddReading,
  onUpdateReading,
  onDeleteReading,
  onClearAll,
  onStartDateChange,
  onEndDateChange,
  onApplyDateRange,
  onResetDateRange,
  onAnalyze,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'manual' | 'sample' | 'csv'>('manual');
  const [csvFeedback, setCsvFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [csvTextPaste, setCsvTextPaste] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLoadSamplePreset = (presetReadings: TemperatureReading[], label: string) => {
    const cloned = presetReadings.map((r, idx) => ({
      ...r,
      id: `${r.id}-${Date.now()}-${idx}`,
      originalPosition: idx + 1,
    }));
    onSetReadings(cloned, true);
    setCsvFeedback({
      type: 'success',
      message: `Loaded ${cloned.length} readings (${label}). Click "Analyze Temperatures" below to compute extremes.`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvFeedback(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'text/plain') {
      setCsvFeedback({
        type: 'error',
        message: `Unsupported file "${file.name}". Please upload a valid .csv file with two columns: date,temperature.`,
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || '');
      const result = parseTemperatureCSV(text);
      if (result.error) {
        setCsvFeedback({
          type: 'error',
          message: result.error,
        });
      } else {
        onSetReadings(result.readings, true);
        setCsvFeedback({
          type: 'success',
          message: `Successfully imported ${result.readings.length} temperature readings from "${file.name}".`,
        });
      }
    };
    reader.onerror = () => {
      setCsvFeedback({
        type: 'error',
        message: 'Could not read the selected file in the browser. Please try another CSV file.',
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleParsePastedCSV = () => {
    setCsvFeedback(null);
    const result = parseTemperatureCSV(csvTextPaste);
    if (result.error) {
      setCsvFeedback({
        type: 'error',
        message: result.error,
      });
    } else {
      onSetReadings(result.readings, true);
      setCsvTextPaste('');
      setCsvFeedback({
        type: 'success',
        message: `Successfully imported ${result.readings.length} temperature readings from pasted CSV text.`,
      });
    }
  };

  const handleDownloadSampleCSV = () => {
    const header = 'date,temperature\n';
    const rows = DEFAULT_SAMPLE_READINGS.map((r) => `${r.date},${r.temperature}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thermoscope-sample-readings.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="analyze" className="py-16 md:py-24 border-b border-[#E8E2D6] scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-medium tracking-wider text-[#77776B]">
            <span>INTERACTIVE WORKSPACE</span>
            <span aria-hidden="true">·</span>
            <span>DATASET &amp; RANGE INPUT</span>
          </div>
          <h2
            className="font-serif text-3xl sm:text-4xl font-semibold text-[#252820] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Find Your Temperature Extremes
          </h2>
          <p className="text-sm sm:text-base text-[#77776B]">
            Add your daily readings, choose a date range, and let the algorithm find the extremes.
          </p>
        </div>

        {/* Main Input Card */}
        <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-5 sm:p-8 space-y-7">
          {/* Top Input Method Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8E2D6]">
            {/* Segmented Mode Selector */}
            <div
              role="tablist"
              aria-label="Data input method"
              className="inline-flex items-center gap-1 p-1 bg-[#F8F5EC] border border-[#E8E2D6] rounded-xl self-start"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeInputTab === 'manual'}
                onClick={() => setActiveInputTab('manual')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeInputTab === 'manual'
                    ? 'bg-[#FFFDF7] text-[#252820] shadow-xs border border-[#E8E2D6]/80'
                    : 'text-[#77776B] hover:text-[#252820]'
                }`}
              >
                <PenLine className="w-3.5 h-3.5 text-[#E58A45]" />
                <span>Enter Readings Manually</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeInputTab === 'sample'}
                onClick={() => {
                  setActiveInputTab('sample');
                  handleLoadSamplePreset(DEFAULT_SAMPLE_READINGS, '16-Day Winter to Spring Wave');
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeInputTab === 'sample'
                    ? 'bg-[#FFFDF7] text-[#252820] shadow-xs border border-[#E8E2D6]/80'
                    : 'text-[#77776B] hover:text-[#252820]'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#E58A45]" />
                <span>Load Sample Data</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeInputTab === 'csv'}
                onClick={() => setActiveInputTab('csv')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeInputTab === 'csv'
                    ? 'bg-[#FFFDF7] text-[#252820] shadow-xs border border-[#E8E2D6]/80'
                    : 'text-[#77776B] hover:text-[#252820]'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-[#E58A45]" />
                <span>Import CSV</span>
              </button>
            </div>

            {/* Quick One-Click Sample Loader Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleLoadSamplePreset(DEFAULT_SAMPLE_READINGS, '16-Day Sample Dataset')
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#252820] bg-[#F8F5EC] hover:bg-[#EFE9DA] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Database className="w-3.5 h-3.5 text-[#E58A45]" />
                <span>Reset to 16-Day Sample</span>
              </button>
            </div>
          </div>

          {/* Contextual Panel for Sample Presets */}
          {activeInputTab === 'sample' && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#252820]">
                    Predefined Demonstration Datasets
                  </h3>
                  <p className="text-xs text-[#77776B]">
                    Select a curated dataset to test even/odd sizes, sub-zero readings, or duplicate tie-breaking during your presentation.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleLoadSamplePreset(DEFAULT_SAMPLE_READINGS, '16 Readings · Even Count')
                  }
                  className="px-3 py-1.5 text-xs font-medium bg-[#FFFDF7] hover:bg-[#EFE9DA] text-[#252820] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  16 Readings (Even · Default)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleLoadSamplePreset(ODD_SAMPLE_READINGS, '15 Readings · Odd Count')
                  }
                  className="px-3 py-1.5 text-xs font-medium bg-[#FFFDF7] hover:bg-[#EFE9DA] text-[#252820] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  15 Readings (Odd Count)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleLoadSamplePreset(
                      [
                        { id: 'neg-1', date: '2026-01-01', temperature: -8.5, originalPosition: 1 },
                        { id: 'neg-2', date: '2026-01-02', temperature: -15.0, originalPosition: 2 },
                        { id: 'neg-3', date: '2026-01-03', temperature: 2.0, originalPosition: 3 },
                        { id: 'neg-4', date: '2026-01-04', temperature: -3.5, originalPosition: 4 },
                      ],
                      'Sub-Zero & Negative Readings'
                    )
                  }
                  className="px-3 py-1.5 text-xs font-medium bg-[#FFFDF7] hover:bg-[#EFE9DA] text-[#252820] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  4 Readings (Negative Extremes)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleLoadSamplePreset(
                      [
                        { id: 'dup-1', date: '2026-01-01', temperature: 10.0, originalPosition: 1 },
                        { id: 'dup-2', date: '2026-01-02', temperature: 30.0, originalPosition: 2 },
                        { id: 'dup-3', date: '2026-01-03', temperature: 10.0, originalPosition: 3 },
                        { id: 'dup-4', date: '2026-01-04', temperature: 30.0, originalPosition: 4 },
                      ],
                      'Duplicate Extremes Tie-Break'
                    )
                  }
                  className="px-3 py-1.5 text-xs font-medium bg-[#FFFDF7] hover:bg-[#EFE9DA] text-[#252820] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  4 Readings (Duplicate Extremes)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleLoadSamplePreset(
                      [
                        { id: 'two-1', date: '2026-01-01', temperature: 18.0, originalPosition: 1 },
                        { id: 'two-2', date: '2026-01-02', temperature: 32.0, originalPosition: 2 },
                      ],
                      'Two Readings Base Case'
                    )
                  }
                  className="px-3 py-1.5 text-xs font-medium bg-[#FFFDF7] hover:bg-[#EFE9DA] text-[#252820] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  2 Readings (Base Case)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleLoadSamplePreset(
                      [{ id: 'one-1', date: '2026-01-01', temperature: 25.0, originalPosition: 1 }],
                      'Single Reading Base Case'
                    )
                  }
                  className="px-3 py-1.5 text-xs font-medium bg-[#FFFDF7] hover:bg-[#EFE9DA] text-[#252820] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  1 Reading (Base Case)
                </button>
              </div>
            </div>
          )}

          {/* Contextual Panel for CSV Import */}
          {activeInputTab === 'csv' && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#252820]">
                    Import Local CSV File
                  </h3>
                  <p className="text-xs text-[#77776B]">
                    Upload a two-column CSV file (<code className="font-mono text-[#252820]">date,temperature</code>) such as <code className="font-mono text-[#252820]">2026-01-01,18.5</code>. Parsed locally in your browser.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSampleCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#252820] bg-[#FFFDF7] hover:bg-[#EFE9DA] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-[#E58A45]" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Picker Box */}
                <div className="p-4 rounded-xl bg-[#FFFDF7] border border-dashed border-[#E8E2D6] flex flex-col items-center justify-center text-center space-y-2.5">
                  <FileSpreadsheet className="w-7 h-7 text-[#E58A45]" strokeWidth={1.6} />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#252820]">
                      Select a .csv file from your computer
                    </p>
                    <p className="text-[11px] text-[#77776B] font-mono">
                      Format: 2026-01-01,18.5
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-file-upload-input"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#FFFDF7] bg-[#252820] hover:bg-[#3A3E33] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose CSV File</span>
                  </button>
                </div>

                {/* Direct CSV Text Paste Box */}
                <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#E8E2D6] flex flex-col justify-between space-y-2.5">
                  <label
                    htmlFor="csv-paste-textarea"
                    className="block text-xs font-medium text-[#252820]"
                  >
                    Or paste CSV rows directly:
                  </label>
                  <textarea
                    id="csv-paste-textarea"
                    rows={3}
                    value={csvTextPaste}
                    onChange={(e) => setCsvTextPaste(e.target.value)}
                    placeholder={`date,temperature\n2026-01-01,18.5\n2026-01-02,-3.4`}
                    className="w-full p-2.5 text-xs font-mono bg-[#F8F5EC] border border-[#E8E2D6] rounded-lg text-[#252820] focus:outline-none focus:border-[#E58A45] resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleParsePastedCSV}
                    disabled={!csvTextPaste.trim()}
                    className="self-end inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#252820] bg-[#F8F5EC] hover:bg-[#EFE9DA] disabled:opacity-45 border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Parse Pasted CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback banner for CSV or Preset load */}
          {csvFeedback && (
            <div
              role="status"
              className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border text-xs ${
                csvFeedback.type === 'success'
                  ? 'bg-[#67866A]/10 border-[#67866A]/30 text-[#252820]'
                  : 'bg-[#E46F55]/10 border-[#E46F55]/30 text-[#E46F55]'
              }`}
            >
              <div className="flex items-center gap-2">
                {csvFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#67866A] shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#E46F55] shrink-0" />
                )}
                <span className="font-medium">{csvFeedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setCsvFeedback(null)}
                className="text-[#77776B] hover:text-[#252820] font-mono text-xs cursor-pointer"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          )}

          {/* Editable Readings Table + Manual Add Form */}
          <ReadingTable
            readings={readings}
            includedIds={includedIds}
            onAddReading={onAddReading}
            onUpdateReading={onUpdateReading}
            onDeleteReading={onDeleteReading}
            onClearAll={onClearAll}
          />

          {/* Date-Range Selection */}
          <DateRangeFilter
            readings={readings}
            startDateInput={startDateInput}
            endDateInput={endDateInput}
            appliedStartDate={appliedStartDate}
            appliedEndDate={appliedEndDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            onApplyDateRange={onApplyDateRange}
            onResetDateRange={onResetDateRange}
            rangeError={rangeError}
          />

          {/* Validation error before main action */}
          {validationError && (
            <div
              role="alert"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#E46F55]/10 border border-[#E46F55]/30 text-xs sm:text-sm text-[#E46F55] font-medium"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Prominent Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E8E2D6]">
            <div className="text-xs text-[#77776B]">
              <span>Ready to analyze </span>
              <span className="font-mono font-semibold text-[#252820] tabular-nums">
                {includedIds.size}
              </span>
              <span> {includedIds.size === 1 ? 'reading' : 'readings'} using recursive Divide &amp; Conquer and Linear Baseline.</span>
            </div>

            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing || readings.length === 0 || includedIds.size === 0}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-[#FFFDF7] bg-[#E58A45] hover:bg-[#d37935] disabled:opacity-45 disabled:pointer-events-none rounded-xl transition-all duration-150 shadow-xs cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252820]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isAnalyzing ? 'Analyzing Readings...' : 'Analyze Temperatures'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
