import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  TemperatureReading,
  AnalyzedReading,
  MinMaxResult,
  DEFAULT_SAMPLE_READINGS,
  filterReadingsByDateRange,
  validateReadings,
  minMaxDivideAndConquer,
  minMaxLinear,
} from './utils/temperatureAlgorithms';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TemperatureInput } from './components/TemperatureInput';
import { ResultsSection } from './components/ResultsSection';
import { AlgorithmVisualizer } from './components/AlgorithmVisualizer';
import { HowItWorks } from './components/HowItWorks';
import { ComplexitySection } from './components/ComplexitySection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

export function App() {
  const [readings, setReadings] = useState<TemperatureReading[]>(() =>
    DEFAULT_SAMPLE_READINGS.map((r, i) => ({ ...r, originalPosition: i + 1 }))
  );

  // Date range inputs (in the form) vs applied filter
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  // Validation and analysis state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSection, setActiveSection] = useState('analyze');

  // Compute filtered readings based on appliedStartDate and appliedEndDate
  const filterOutcome = useMemo(
    () => filterReadingsByDateRange(readings, appliedStartDate, appliedEndDate),
    [readings, appliedStartDate, appliedEndDate]
  );

  const includedIds = useMemo(
    () => new Set(filterOutcome.filtered.map((r) => r.id)),
    [filterOutcome.filtered]
  );

  // Compute Divide & Conquer and Linear Baseline results whenever valid filtered readings exist
  const analysisResults = useMemo<{
    analyzedReadings: AnalyzedReading[];
    dacResult: MinMaxResult | null;
    linearResult: MinMaxResult | null;
  }>(() => {
    const validation = validateReadings(readings);
    if (!validation.isValid || filterOutcome.error || filterOutcome.filtered.length === 0) {
      return {
        analyzedReadings: [],
        dacResult: null,
        linearResult: null,
      };
    }

    const dac = minMaxDivideAndConquer(filterOutcome.filtered);
    const linear = minMaxLinear(filterOutcome.filtered);

    return {
      analyzedReadings: filterOutcome.filtered,
      dacResult: dac,
      linearResult: linear,
    };
  }, [readings, filterOutcome]);

  // IntersectionObserver for active navigation highlight
  useEffect(() => {
    const sectionIds = ['how-it-works', 'analyze', 'algorithm', 'about'];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: 0.05 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Handlers for modifying dataset
  const handleSetReadings = useCallback(
    (newReadings: TemperatureReading[], resetRange = false) => {
      const normalized = newReadings.map((r, idx) => ({
        ...r,
        originalPosition: idx + 1,
      }));
      setReadings(normalized);
      setValidationError(null);
      if (resetRange) {
        setStartDateInput('');
        setEndDateInput('');
        setAppliedStartDate('');
        setAppliedEndDate('');
      }
    },
    []
  );

  const handleAddReading = useCallback((date: string, temperature: number) => {
    setValidationError(null);
    setReadings((prev) => {
      const next = [
        ...prev,
        {
          id: `reading-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          date,
          temperature,
          originalPosition: prev.length + 1,
        },
      ];
      return next.map((r, i) => ({ ...r, originalPosition: i + 1 }));
    });
  }, []);

  const handleUpdateReading = useCallback(
    (id: string, field: 'date' | 'temperature', value: string) => {
      setValidationError(null);
      setReadings((prev) =>
        prev.map((item, idx) => {
          if (item.id !== id) return { ...item, originalPosition: idx + 1 };
          if (field === 'date') {
            return { ...item, date: value, originalPosition: idx + 1 };
          } else {
            const num = value.trim() === '' || value === '-' ? Number.NaN : Number(value);
            return {
              ...item,
              temperature: num,
              originalPosition: idx + 1,
            };
          }
        })
      );
    },
    []
  );

  const handleDeleteReading = useCallback((id: string) => {
    setValidationError(null);
    setReadings((prev) =>
      prev
        .filter((r) => r.id !== id)
        .map((r, idx) => ({ ...r, originalPosition: idx + 1 }))
    );
  }, []);

  const handleClearAll = useCallback(() => {
    setReadings([]);
    setStartDateInput('');
    setEndDateInput('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setValidationError('Dataset cleared. Add readings manually, load sample data, or import a CSV file to analyze.');
  }, []);

  const handleApplyDateRange = useCallback(() => {
    setValidationError(null);
    setAppliedStartDate(startDateInput.trim());
    setAppliedEndDate(endDateInput.trim());
  }, [startDateInput, endDateInput]);

  const handleResetDateRange = useCallback(() => {
    setValidationError(null);
    setStartDateInput('');
    setEndDateInput('');
    setAppliedStartDate('');
    setAppliedEndDate('');
  }, []);

  const handleAnalyze = useCallback(() => {
    setValidationError(null);

    // Sync any typed date range first
    const nextStart = startDateInput.trim();
    const nextEnd = endDateInput.trim();
    setAppliedStartDate(nextStart);
    setAppliedEndDate(nextEnd);

    const validation = validateReadings(readings);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    const rangeCheck = filterReadingsByDateRange(readings, nextStart, nextEnd);
    if (rangeCheck.error || rangeCheck.filtered.length === 0) {
      setValidationError(
        rangeCheck.error || 'No valid temperature readings found in the selected date range.'
      );
      return;
    }

    setIsAnalyzing(true);
    window.setTimeout(() => {
      setIsAnalyzing(false);
      const resultsEl = document.getElementById('results');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 140);
  }, [readings, startDateInput, endDateInput]);

  const handleLoadTestDataset = useCallback(
    (testReadings: TemperatureReading[]) => {
      handleSetReadings(testReadings, true);
      const analyzeEl = document.getElementById('results') || document.getElementById('analyze');
      if (analyzeEl) {
        analyzeEl.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [handleSetReadings]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EC] text-[#252820]">
      {/* Section A: Sticky Navigation Bar */}
      <Navbar activeSection={activeSection} />

      <main className="flex-1">
        {/* Section B: Hero Section */}
        <HeroSection
          currentResult={analysisResults.dacResult}
          totalAnalyzed={analysisResults.analyzedReadings.length}
        />

        {/* Section 8: How It Works (3-Step Educational Overview & Pseudocode) */}
        <HowItWorks />

        {/* Section C: Temperature Analyzer Input Workspace */}
        <TemperatureInput
          readings={readings}
          includedIds={includedIds}
          startDateInput={startDateInput}
          endDateInput={endDateInput}
          appliedStartDate={appliedStartDate}
          appliedEndDate={appliedEndDate}
          rangeError={filterOutcome.error}
          validationError={validationError}
          isAnalyzing={isAnalyzing}
          onSetReadings={handleSetReadings}
          onAddReading={handleAddReading}
          onUpdateReading={handleUpdateReading}
          onDeleteReading={handleDeleteReading}
          onClearAll={handleClearAll}
          onStartDateChange={setStartDateInput}
          onEndDateChange={setEndDateInput}
          onApplyDateRange={handleApplyDateRange}
          onResetDateRange={handleResetDateRange}
          onAnalyze={handleAnalyze}
        />

        {/* Section 4 & 7: Results Section, Comparison Chart & Temperature Line Chart */}
        <ResultsSection
          analyzedReadings={analysisResults.analyzedReadings}
          totalUnfilteredCount={readings.length}
          dacResult={analysisResults.dacResult}
          linearResult={analysisResults.linearResult}
        />

        {/* Section 6: Interactive Algorithm Visualization */}
        <AlgorithmVisualizer
          analyzedReadings={analysisResults.analyzedReadings}
        />

        {/* Section 9: Complexity Explanation & Automated 10-Case Test Suite */}
        <ComplexitySection onLoadTestDataset={handleLoadTestDataset} />

        {/* Section 11: About Project Section */}
        <AboutSection />
      </main>

      {/* Section 12: Minimal Footer */}
      <Footer />
    </div>
  );
}

export default App;
