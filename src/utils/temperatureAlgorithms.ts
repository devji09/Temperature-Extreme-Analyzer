export interface TemperatureReading {
  id: string;
  date: string;
  temperature: number;
  originalPosition: number; // 1-indexed position in the unfiltered dataset
}

export interface AnalyzedReading extends TemperatureReading {
  filteredPosition: number; // 1-indexed position within the analyzed (filtered) slice
}

export interface MinMaxResult {
  minimum: AnalyzedReading;
  maximum: AnalyzedReading;
  comparisons: number;
}

export type RecursionStepType = 'DIVIDE' | 'BASE_ONE' | 'BASE_TWO' | 'COMBINE';

export interface RecursionNodeData {
  id: string;
  low: number;
  high: number;
  mid?: number;
  depth: number;
  readingsSlice: AnalyzedReading[];
  minimum?: AnalyzedReading;
  maximum?: AnalyzedReading;
  localComparisons: number;
  cumulativeComparisonsAfterResolve: number;
  leftId?: string;
  rightId?: string;
  isBaseCase: boolean;
  baseCaseType?: 'SINGLE' | 'PAIR';
}

export interface RecursionStep {
  stepNumber: number;
  type: RecursionStepType;
  nodeId: string;
  low: number;
  high: number;
  mid?: number;
  depth: number;
  title: string;
  description: string;
  comparisonsAdded: number;
  cumulativeComparisons: number;
  resolvedNodes: Record<string, {
    minimum: AnalyzedReading;
    maximum: AnalyzedReading;
    localComparisons: number;
  }>;
  activeNodeIds: string[];
  comparingChildrenIds?: [string, string];
  minComparisonDetail?: {
    left: AnalyzedReading;
    right: AnalyzedReading;
    winner: AnalyzedReading;
  };
  maxComparisonDetail?: {
    left: AnalyzedReading;
    right: AnalyzedReading;
    winner: AnalyzedReading;
  };
}

export interface RecursionVisualizationData {
  rootNodeId: string;
  nodes: Record<string, RecursionNodeData>;
  steps: RecursionStep[];
  maxDepth: number;
}

/**
 * Pure recursive Divide and Conquer Min-Max implementation.
 * Conceptually follows: minMax(readings, low, high)
 *
 * Counts ONLY temperature value comparisons used to determine minimum or maximum:
 * - Base case 1 (low === high): 0 temperature comparisons
 * - Base case 2 (high === low + 1): 1 temperature comparison
 * - Combine step: 2 temperature comparisons (1 for min, 1 for max)
 *
 * Tie-breaking rule: Earliest occurrence in the analyzed input order wins.
 */
export function minMaxDivideAndConquer(readings: readonly AnalyzedReading[]): MinMaxResult | null {
  if (!readings || readings.length === 0) {
    return null;
  }

  let comparisonCounter = 0;

  function minMax(
    arr: readonly AnalyzedReading[],
    low: number,
    high: number
  ): { minimum: AnalyzedReading; maximum: AnalyzedReading } {
    // Base Case 1: One element -> 0 temperature comparisons
    if (low === high) {
      return {
        minimum: arr[low],
        maximum: arr[low],
      };
    }

    // Base Case 2: Two elements -> 1 temperature comparison
    if (high === low + 1) {
      comparisonCounter += 1;
      // Single temperature comparison between arr[low] and arr[high].
      // Since low < high, arr[low] is the earlier occurrence.
      // If arr[low].temperature === arr[high].temperature, arr[low] is returned for both min and max
      // to preserve earliest occurrence in analyzed input order.
      if (arr[low].temperature < arr[high].temperature) {
        return {
          minimum: arr[low],
          maximum: arr[high],
        };
      } else if (arr[low].temperature > arr[high].temperature) {
        return {
          minimum: arr[high],
          maximum: arr[low],
        };
      } else {
        return {
          minimum: arr[low],
          maximum: arr[low],
        };
      }
    }

    // Recursive Case: 3 or more elements
    const mid = Math.floor((low + high) / 2);
    const leftResult = minMax(arr, low, mid);
    const rightResult = minMax(arr, mid + 1, high);

    // Combine minimum: 1 temperature comparison
    // Use <= so leftResult (earlier occurrence) wins ties
    comparisonCounter += 1;
    const combinedMinimum =
      leftResult.minimum.temperature <= rightResult.minimum.temperature
        ? leftResult.minimum
        : rightResult.minimum;

    // Combine maximum: 1 temperature comparison
    // Use >= so leftResult (earlier occurrence) wins ties
    comparisonCounter += 1;
    const combinedMaximum =
      leftResult.maximum.temperature >= rightResult.maximum.temperature
        ? leftResult.maximum
        : rightResult.maximum;

    return {
      minimum: combinedMinimum,
      maximum: combinedMaximum,
    };
  }

  const result = minMax(readings, 0, readings.length - 1);

  return {
    minimum: result.minimum,
    maximum: result.maximum,
    comparisons: comparisonCounter,
  };
}

/**
 * Linear Baseline Min-Max implementation.
 * Initializes minimum and maximum using the first reading, then scans remaining readings.
 * Performs 2(n - 1) temperature comparisons for n >= 1 (0 comparisons when n === 1).
 * Tie-breaking rule: Earliest occurrence in analyzed input order wins (strict < and >).
 */
export function minMaxLinear(readings: readonly AnalyzedReading[]): MinMaxResult | null {
  if (!readings || readings.length === 0) {
    return null;
  }

  let currentMin = readings[0];
  let currentMax = readings[0];
  let comparisonCounter = 0;

  for (let i = 1; i < readings.length; i++) {
    const candidate = readings[i];

    // 1st temperature comparison: candidate vs currentMin
    comparisonCounter += 1;
    if (candidate.temperature < currentMin.temperature) {
      currentMin = candidate;
    }

    // 2nd temperature comparison: candidate vs currentMax
    comparisonCounter += 1;
    if (candidate.temperature > currentMax.temperature) {
      currentMax = candidate;
    }
  }

  return {
    minimum: currentMin,
    maximum: currentMax,
    comparisons: comparisonCounter,
  };
}

/**
 * Builds the complete recursion tree and step-by-step execution trace
 * for interactive visualization of the Divide and Conquer algorithm.
 */
export function buildRecursionSteps(readings: readonly AnalyzedReading[]): RecursionVisualizationData | null {
  if (!readings || readings.length === 0) {
    return null;
  }

  const nodes: Record<string, RecursionNodeData> = {};
  const steps: RecursionStep[] = [];
  const currentResolved: Record<string, {
    minimum: AnalyzedReading;
    maximum: AnalyzedReading;
    localComparisons: number;
  }> = {};

  let cumulativeComparisons = 0;
  let maxDepth = 0;

  function cloneResolved() {
    const copy: Record<string, {
      minimum: AnalyzedReading;
      maximum: AnalyzedReading;
      localComparisons: number;
    }> = {};
    for (const key of Object.keys(currentResolved)) {
      copy[key] = { ...currentResolved[key] };
    }
    return copy;
  }

  function trace(
    low: number,
    high: number,
    depth: number
  ): { id: string; minimum: AnalyzedReading; maximum: AnalyzedReading } {
    if (depth > maxDepth) {
      maxDepth = depth;
    }

    const nodeId = `node-${low}-${high}`;
    const slice = readings.slice(low, high + 1);

    // Base Case 1: Single element
    if (low === high) {
      const item = readings[low];
      nodes[nodeId] = {
        id: nodeId,
        low,
        high,
        depth,
        readingsSlice: slice,
        minimum: item,
        maximum: item,
        localComparisons: 0,
        cumulativeComparisonsAfterResolve: cumulativeComparisons,
        isBaseCase: true,
        baseCaseType: 'SINGLE',
      };

      currentResolved[nodeId] = {
        minimum: item,
        maximum: item,
        localComparisons: 0,
      };

      steps.push({
        stepNumber: steps.length + 1,
        type: 'BASE_ONE',
        nodeId,
        low,
        high,
        depth,
        title: `Base Case (1 Reading): Record #${item.originalPosition}`,
        description: `Subrange [${low + 1}] contains a single reading (${item.temperature.toFixed(1)}°C on ${item.date}). Returned immediately as both local minimum and maximum with 0 temperature comparisons.`,
        comparisonsAdded: 0,
        cumulativeComparisons,
        resolvedNodes: cloneResolved(),
        activeNodeIds: [nodeId],
      });

      return { id: nodeId, minimum: item, maximum: item };
    }

    // Base Case 2: Two elements
    if (high === low + 1) {
      const first = readings[low];
      const second = readings[high];
      cumulativeComparisons += 1;

      let localMin: AnalyzedReading;
      let localMax: AnalyzedReading;

      if (first.temperature < second.temperature) {
        localMin = first;
        localMax = second;
      } else if (first.temperature > second.temperature) {
        localMin = second;
        localMax = first;
      } else {
        localMin = first;
        localMax = first;
      }

      nodes[nodeId] = {
        id: nodeId,
        low,
        high,
        depth,
        readingsSlice: slice,
        minimum: localMin,
        maximum: localMax,
        localComparisons: 1,
        cumulativeComparisonsAfterResolve: cumulativeComparisons,
        isBaseCase: true,
        baseCaseType: 'PAIR',
      };

      currentResolved[nodeId] = {
        minimum: localMin,
        maximum: localMax,
        localComparisons: 1,
      };

      steps.push({
        stepNumber: steps.length + 1,
        type: 'BASE_TWO',
        nodeId,
        low,
        high,
        depth,
        title: `Base Case (2 Readings): Compare #${first.originalPosition} & #${second.originalPosition}`,
        description: `Subrange [${low + 1}..${high + 1}] compares ${first.temperature.toFixed(1)}°C (${first.date}) vs ${second.temperature.toFixed(1)}°C (${second.date}) in 1 comparison → Min: ${localMin.temperature.toFixed(1)}°C, Max: ${localMax.temperature.toFixed(1)}°C.`,
        comparisonsAdded: 1,
        cumulativeComparisons,
        resolvedNodes: cloneResolved(),
        activeNodeIds: [nodeId],
        minComparisonDetail: {
          left: first,
          right: second,
          winner: localMin,
        },
        maxComparisonDetail: {
          left: first,
          right: second,
          winner: localMax,
        },
      });

      return { id: nodeId, minimum: localMin, maximum: localMax };
    }

    // Recursive Step: Divide
    const mid = Math.floor((low + high) / 2);
    const leftId = `node-${low}-${mid}`;
    const rightId = `node-${mid + 1}-${high}`;

    nodes[nodeId] = {
      id: nodeId,
      low,
      high,
      mid,
      depth,
      readingsSlice: slice,
      localComparisons: 2,
      cumulativeComparisonsAfterResolve: 0,
      leftId,
      rightId,
      isBaseCase: false,
    };

    steps.push({
      stepNumber: steps.length + 1,
      type: 'DIVIDE',
      nodeId,
      low,
      high,
      mid,
      depth,
      title: `Divide Range [${low + 1}..${high + 1}] at Midpoint ${mid + 1}`,
      description: `Splitting ${high - low + 1} readings into Left Half [${low + 1}..${mid + 1}] and Right Half [${mid + 2}..${high + 1}].`,
      comparisonsAdded: 0,
      cumulativeComparisons,
      resolvedNodes: cloneResolved(),
      activeNodeIds: [nodeId, leftId, rightId],
    });

    const leftRes = trace(low, mid, depth + 1);
    const rightRes = trace(mid + 1, high, depth + 1);

    // Combine Step: 2 comparisons
    cumulativeComparisons += 2;

    const combinedMin =
      leftRes.minimum.temperature <= rightRes.minimum.temperature
        ? leftRes.minimum
        : rightRes.minimum;

    const combinedMax =
      leftRes.maximum.temperature >= rightRes.maximum.temperature
        ? leftRes.maximum
        : rightRes.maximum;

    nodes[nodeId].minimum = combinedMin;
    nodes[nodeId].maximum = combinedMax;
    nodes[nodeId].cumulativeComparisonsAfterResolve = cumulativeComparisons;

    currentResolved[nodeId] = {
      minimum: combinedMin,
      maximum: combinedMax,
      localComparisons: 2,
    };

    steps.push({
      stepNumber: steps.length + 1,
      type: 'COMBINE',
      nodeId,
      low,
      high,
      mid,
      depth,
      title: `Combine [${low + 1}..${mid + 1}] & [${mid + 2}..${high + 1}]`,
      description: `Compared minimums (${leftRes.minimum.temperature.toFixed(1)}°C vs ${rightRes.minimum.temperature.toFixed(1)}°C → ${combinedMin.temperature.toFixed(1)}°C) and maximums (${leftRes.maximum.temperature.toFixed(1)}°C vs ${rightRes.maximum.temperature.toFixed(1)}°C → ${combinedMax.temperature.toFixed(1)}°C) using 2 comparisons.`,
      comparisonsAdded: 2,
      cumulativeComparisons,
      resolvedNodes: cloneResolved(),
      activeNodeIds: [nodeId, leftId, rightId],
      comparingChildrenIds: [leftId, rightId],
      minComparisonDetail: {
        left: leftRes.minimum,
        right: rightRes.minimum,
        winner: combinedMin,
      },
      maxComparisonDetail: {
        left: leftRes.maximum,
        right: rightRes.maximum,
        winner: combinedMax,
      },
    });

    return { id: nodeId, minimum: combinedMin, maximum: combinedMax };
  }

  const root = trace(0, readings.length - 1, 0);

  return {
    rootNodeId: root.id,
    nodes,
    steps,
    maxDepth,
  };
}

/**
 * Checks if a label is a valid ISO YYYY-MM-DD calendar date.
 */
export function isISODateString(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return false;
  }
  const date = new Date(`${trimmed}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(trimmed);
}

/**
 * Formats a date string or day label into a clean human-readable format.
 * E.g. "2026-01-05" -> "January 5, 2026", while "Day 5" remains "Day 5".
 */
export function formatDateLabel(dateStr: string): string {
  if (isISODateString(dateStr)) {
    const [year, month, day] = dateStr.trim().split('-').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
  return dateStr.trim();
}

/**
 * Formats a date string into a compact label for chart axes.
 * E.g. "2026-01-05" -> "Jan 5", while "Day 5" remains "Day 5".
 */
export function formatShortDateLabel(dateStr: string): string {
  if (isISODateString(dateStr)) {
    const [year, month, day] = dateStr.trim().split('-').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }
  return dateStr.trim();
}

/**
 * Filters readings by start and end date/label while preserving each reading's
 * originalPosition from the unfiltered dataset and relative input order.
 *
 * Supports:
 * 1. ISO Calendar Dates (YYYY-MM-DD): Inclusive lexicographical/calendar comparison.
 * 2. Custom Day Labels (e.g., "Day 1", "Reading A"): Inclusive index slice between
 *    the matching start label and end label in the list, or exact match.
 */
export function filterReadingsByDateRange(
  readings: readonly TemperatureReading[],
  startFilter: string,
  endFilter: string
): {
  filtered: AnalyzedReading[];
  error: string | null;
} {
  // Always ensure originalPosition is 1-indexed according to the unfiltered array
  const normalizedReadings: TemperatureReading[] = readings.map((r, idx) => ({
    ...r,
    originalPosition: idx + 1,
  }));

  const start = startFilter.trim();
  const end = endFilter.trim();

  if (!start && !end) {
    return {
      filtered: normalizedReadings.map((r, idx) => ({
        ...r,
        filteredPosition: idx + 1,
      })),
      error: null,
    };
  }

  const allAreISO = normalizedReadings.every((r) => isISODateString(r.date));
  const filterIsISO = (!start || isISODateString(start)) && (!end || isISODateString(end));

  if (allAreISO && filterIsISO) {
    if (start && end && start > end) {
      return {
        filtered: [],
        error: 'Start date cannot be later than end date. Please adjust your range.',
      };
    }

    const matched = normalizedReadings.filter((r) => {
      const d = r.date.trim();
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });

    if (matched.length === 0) {
      return {
        filtered: [],
        error: `No temperature readings found between ${start || 'the beginning'} and ${end || 'the end'}.`,
      };
    }

    return {
      filtered: matched.map((r, idx) => ({
        ...r,
        filteredPosition: idx + 1,
      })),
      error: null,
    };
  }

  // Fallback for custom day labels (e.g. "Day 1" to "Day 5") or mixed datasets:
  // If both start and end match labels in the dataset, slice inclusively by their positions.
  // If ISO strings are compared against ISO strings in a mixed dataset, filter ISO rows.
  let startIdx = 0;
  let endIdx = normalizedReadings.length - 1;

  if (start) {
    const foundStartIdx = normalizedReadings.findIndex(
      (r) => r.date.trim().toLowerCase() === start.toLowerCase()
    );
    if (foundStartIdx !== -1) {
      startIdx = foundStartIdx;
    } else if (isISODateString(start)) {
      // Filter ISO dates >= start
      const isoMatched = normalizedReadings.filter((r) => {
        const d = r.date.trim();
        if (!isISODateString(d)) return false;
        if (d < start) return false;
        if (end && isISODateString(end) && d > end) return false;
        return true;
      });
      if (isoMatched.length === 0) {
        return {
          filtered: [],
          error: 'No readings match the selected date range.',
        };
      }
      return {
        filtered: isoMatched.map((r, idx) => ({
          ...r,
          filteredPosition: idx + 1,
        })),
        error: null,
      };
    } else {
      return {
        filtered: [],
        error: `Start label "${start}" was not found in the current readings.`,
      };
    }
  }

  if (end) {
    // Find last occurrence of the end label
    let foundEndIdx = -1;
    for (let i = normalizedReadings.length - 1; i >= 0; i--) {
      if (normalizedReadings[i].date.trim().toLowerCase() === end.toLowerCase()) {
        foundEndIdx = i;
        break;
      }
    }
    if (foundEndIdx !== -1) {
      endIdx = foundEndIdx;
    } else if (isISODateString(end)) {
      const isoMatched = normalizedReadings.filter((r) => {
        const d = r.date.trim();
        if (!isISODateString(d)) return false;
        if (start && isISODateString(start) && d < start) return false;
        if (d > end) return false;
        return true;
      });
      if (isoMatched.length === 0) {
        return {
          filtered: [],
          error: 'No readings match the selected date range.',
        };
      }
      return {
        filtered: isoMatched.map((r, idx) => ({
          ...r,
          filteredPosition: idx + 1,
        })),
        error: null,
      };
    } else {
      return {
        filtered: [],
        error: `End label "${end}" was not found in the current readings.`,
      };
    }
  }

  if (startIdx > endIdx) {
    return {
      filtered: [],
      error: `Selected start reading ("${start}") appears after the end reading ("${end}") in the dataset.`,
    };
  }

  const sliced = normalizedReadings.slice(startIdx, endIdx + 1);
  return {
    filtered: sliced.map((r, idx) => ({
      ...r,
      filteredPosition: idx + 1,
    })),
    error: null,
  };
}

/**
 * Validates an array of readings before analysis.
 */
export function validateReadings(readings: readonly TemperatureReading[]): {
  isValid: boolean;
  error: string | null;
} {
  if (!readings || readings.length === 0) {
    return {
      isValid: false,
      error: 'Please add at least one temperature reading before running the analysis.',
    };
  }

  for (let i = 0; i < readings.length; i++) {
    const r = readings[i];
    if (!r.date || r.date.trim() === '') {
      return {
        isValid: false,
        error: `Row #${i + 1} is missing a date or day label.`,
      };
    }
    if (typeof r.temperature !== 'number' || !Number.isFinite(r.temperature)) {
      return {
        isValid: false,
        error: `Row #${i + 1} ("${r.date}") has an invalid temperature value. Only finite numbers are allowed.`,
      };
    }
    if (r.temperature < -100 || r.temperature > 100) {
      return {
        isValid: false,
        error: `Row #${i + 1} ("${r.date}") has an out-of-range temperature (${r.temperature}°C). Please enter realistic values between -100°C and 100°C.`,
      };
    }
  }

  return { isValid: true, error: null };
}

/**
 * Parses CSV text with two columns: date,temperature
 * Handles optional headers, blank lines, negative numbers, and decimal values.
 */
export function parseTemperatureCSV(csvContent: string): {
  readings: TemperatureReading[];
  error: string | null;
} {
  if (!csvContent || !csvContent.trim()) {
    return {
      readings: [],
      error: 'The uploaded CSV file is empty. Expected format: date,temperature',
    };
  }

  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      readings: [],
      error: 'No readable rows found in the CSV file.',
    };
  }

  const parsed: TemperatureReading[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const parts = rawLine.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));

    // Check if first row is a header row like "date,temperature"
    if (i === 0) {
      const col1Lower = (parts[0] || '').toLowerCase();
      const col2Lower = (parts[1] || '').toLowerCase();
      const secondIsNumber = parts.length >= 2 && parts[1] !== '' && Number.isFinite(Number(parts[1]));
      if (
        !secondIsNumber &&
        (col1Lower.includes('date') ||
          col1Lower.includes('day') ||
          col2Lower.includes('temp') ||
          col2Lower.includes('reading'))
      ) {
        continue;
      }
    }

    if (parts.length !== 2) {
      return {
        readings: [],
        error: `Invalid column structure on line ${i + 1}: "${rawLine}". Expected exactly 2 columns: date,temperature (e.g. 2026-01-01,18.5).`,
      };
    }

    const [dateLabel, tempRaw] = parts;
    if (!dateLabel) {
      return {
        readings: [],
        error: `Missing date or day label on line ${i + 1}: "${rawLine}".`,
      };
    }

    // Strip optional °C or C suffix if user included it
    const cleanedTempStr = tempRaw.replace(/°?[cC]$/, '').trim();
    if (cleanedTempStr === '') {
      return {
        readings: [],
        error: `Missing temperature value on line ${i + 1} for "${dateLabel}".`,
      };
    }

    const tempValue = Number(cleanedTempStr);
    if (!Number.isFinite(tempValue)) {
      return {
        readings: [],
        error: `Invalid temperature "${tempRaw}" on line ${i + 1} for "${dateLabel}". Temperature must be a valid finite number.`,
      };
    }

    if (tempValue < -100 || tempValue > 100) {
      return {
        readings: [],
        error: `Temperature ${tempValue}°C on line ${i + 1} is outside the valid range (-100°C to 100°C).`,
      };
    }

    parsed.push({
      id: `csv-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: dateLabel,
      temperature: Math.round(tempValue * 100) / 100,
      originalPosition: parsed.length + 1,
    });
  }

  if (parsed.length === 0) {
    return {
      readings: [],
      error: 'The CSV file contained a header row but no temperature data rows.',
    };
  }

  return {
    readings: parsed,
    error: null,
  };
}

/**
 * Predefined 16-record sample dataset (even count, includes negative, decimal, warm, and cold extremes)
 * plus a 15-record odd dataset and quick presets for college presentation demos.
 */
export const DEFAULT_SAMPLE_READINGS: TemperatureReading[] = [
  { id: 'sample-1', date: '2026-01-01', temperature: 14.2, originalPosition: 1 },
  { id: 'sample-2', date: '2026-01-02', temperature: 11.8, originalPosition: 2 },
  { id: 'sample-3', date: '2026-01-03', temperature: 6.5, originalPosition: 3 },
  { id: 'sample-4', date: '2026-01-04', temperature: -1.4, originalPosition: 4 },
  { id: 'sample-5', date: '2026-01-05', temperature: -6.8, originalPosition: 5 },
  { id: 'sample-6', date: '2026-01-06', temperature: -2.1, originalPosition: 6 },
  { id: 'sample-7', date: '2026-01-07', temperature: 4.9, originalPosition: 7 },
  { id: 'sample-8', date: '2026-01-08', temperature: 12.3, originalPosition: 8 },
  { id: 'sample-9', date: '2026-01-09', temperature: 19.6, originalPosition: 9 },
  { id: 'sample-10', date: '2026-01-10', temperature: 24.0, originalPosition: 10 },
  { id: 'sample-11', date: '2026-01-11', temperature: 31.4, originalPosition: 11 },
  { id: 'sample-12', date: '2026-01-12', temperature: 34.8, originalPosition: 12 },
  { id: 'sample-13', date: '2026-01-13', temperature: 28.5, originalPosition: 13 },
  { id: 'sample-14', date: '2026-01-14', temperature: 21.2, originalPosition: 14 },
  { id: 'sample-15', date: '2026-01-15', temperature: 16.7, originalPosition: 15 },
  { id: 'sample-16', date: '2026-01-16', temperature: 13.9, originalPosition: 16 },
];

export const ODD_SAMPLE_READINGS: TemperatureReading[] = DEFAULT_SAMPLE_READINGS.slice(0, 15);

export interface VerificationTestResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details: string;
  sampleReadings?: TemperatureReading[];
}

/**
 * Executes the automated verification test cases specified in Section 15
 * so students and faculty can inspect and load every benchmark case live.
 */
export function runSpecificationTestSuite(): VerificationTestResult[] {
  const results: VerificationTestResult[] = [];

  // Test 1: Single reading
  const t1Input: AnalyzedReading[] = [
    { id: 't1-1', date: '2026-01-01', temperature: 25.0, originalPosition: 1, filteredPosition: 1 },
  ];
  const t1DAC = minMaxDivideAndConquer(t1Input);
  const t1Lin = minMaxLinear(t1Input);
  const t1Pass =
    !!t1DAC &&
    !!t1Lin &&
    t1DAC.minimum.temperature === 25.0 &&
    t1DAC.maximum.temperature === 25.0 &&
    t1DAC.comparisons === 0 &&
    t1Lin.comparisons === 0;
  results.push({
    id: 'test-1',
    name: 'Test 1: Single Reading',
    description: 'Input: 2026-01-01, 25.0°C',
    passed: t1Pass,
    details: `Min: ${t1DAC?.minimum.temperature.toFixed(1)}°C, Max: ${t1DAC?.maximum.temperature.toFixed(1)}°C · D&C Comps: ${t1DAC?.comparisons} · Linear Comps: ${t1Lin?.comparisons}`,
    sampleReadings: t1Input.map(({ filteredPosition, ...rest }) => rest),
  });

  // Test 2: Two readings
  const t2Input: AnalyzedReading[] = [
    { id: 't2-1', date: '2026-01-01', temperature: 18.0, originalPosition: 1, filteredPosition: 1 },
    { id: 't2-2', date: '2026-01-02', temperature: 32.0, originalPosition: 2, filteredPosition: 2 },
  ];
  const t2DAC = minMaxDivideAndConquer(t2Input);
  const t2Lin = minMaxLinear(t2Input);
  const t2Pass =
    !!t2DAC &&
    !!t2Lin &&
    t2DAC.minimum.temperature === 18.0 &&
    t2DAC.maximum.temperature === 32.0 &&
    t2DAC.comparisons === 1 &&
    t2Lin.comparisons === 2;
  results.push({
    id: 'test-2',
    name: 'Test 2: Two Readings',
    description: 'Input: 18.0°C and 32.0°C',
    passed: t2Pass,
    details: `Min: ${t2DAC?.minimum.temperature.toFixed(1)}°C, Max: ${t2DAC?.maximum.temperature.toFixed(1)}°C · D&C Comps: ${t2DAC?.comparisons} · Linear Comps: ${t2Lin?.comparisons}`,
    sampleReadings: t2Input.map(({ filteredPosition, ...rest }) => rest),
  });

  // Test 3: Negative temperatures
  const t3Input: AnalyzedReading[] = [
    { id: 't3-1', date: '2026-01-01', temperature: -8.5, originalPosition: 1, filteredPosition: 1 },
    { id: 't3-2', date: '2026-01-02', temperature: -15.0, originalPosition: 2, filteredPosition: 2 },
    { id: 't3-3', date: '2026-01-03', temperature: 2.0, originalPosition: 3, filteredPosition: 3 },
    { id: 't3-4', date: '2026-01-04', temperature: -3.5, originalPosition: 4, filteredPosition: 4 },
  ];
  const t3DAC = minMaxDivideAndConquer(t3Input);
  const t3Lin = minMaxLinear(t3Input);
  const t3Pass =
    !!t3DAC &&
    !!t3Lin &&
    t3DAC.minimum.temperature === -15.0 &&
    t3DAC.maximum.temperature === 2.0 &&
    t3DAC.comparisons === 4 &&
    t3Lin.comparisons === 6;
  results.push({
    id: 'test-3',
    name: 'Test 3: Negative Temperatures',
    description: 'Input: -8.5°C, -15.0°C, 2.0°C, -3.5°C',
    passed: t3Pass,
    details: `Min: ${t3DAC?.minimum.temperature.toFixed(1)}°C, Max: ${t3DAC?.maximum.temperature.toFixed(1)}°C · D&C Comps: ${t3DAC?.comparisons} · Linear Comps: ${t3Lin?.comparisons}`,
    sampleReadings: t3Input.map(({ filteredPosition, ...rest }) => rest),
  });

  // Test 4: Duplicate extreme values
  const t4Input: AnalyzedReading[] = [
    { id: 't4-1', date: '2026-01-01', temperature: 10.0, originalPosition: 1, filteredPosition: 1 },
    { id: 't4-2', date: '2026-01-02', temperature: 30.0, originalPosition: 2, filteredPosition: 2 },
    { id: 't4-3', date: '2026-01-03', temperature: 10.0, originalPosition: 3, filteredPosition: 3 },
    { id: 't4-4', date: '2026-01-04', temperature: 30.0, originalPosition: 4, filteredPosition: 4 },
  ];
  const t4DAC = minMaxDivideAndConquer(t4Input);
  const t4Lin = minMaxLinear(t4Input);
  const t4Pass =
    !!t4DAC &&
    !!t4Lin &&
    t4DAC.minimum.temperature === 10.0 &&
    t4DAC.minimum.date === '2026-01-01' &&
    t4DAC.maximum.temperature === 30.0 &&
    t4DAC.maximum.date === '2026-01-02' &&
    t4DAC.comparisons === 4 &&
    t4Lin.comparisons === 6;
  results.push({
    id: 'test-4',
    name: 'Test 4: Duplicate Extreme Values',
    description: 'Earliest occurrence tie-breaking (2026-01-01 for 10.0°C, 2026-01-02 for 30.0°C)',
    passed: t4Pass,
    details: `Min: ${t4DAC?.minimum.temperature.toFixed(1)}°C (${t4DAC?.minimum.date}), Max: ${t4DAC?.maximum.temperature.toFixed(1)}°C (${t4DAC?.maximum.date}) · D&C: ${t4DAC?.comparisons} · Linear: ${t4Lin?.comparisons}`,
    sampleReadings: t4Input.map(({ filteredPosition, ...rest }) => rest),
  });

  // Test 5 & 6: Empty dataset & Invalid temperature validation
  const t5Empty = validateReadings([]);
  const t6Nan = validateReadings([
    { id: 'bad', date: '2026-01-01', temperature: Number.NaN, originalPosition: 1 },
  ]);
  results.push({
    id: 'test-5-6',
    name: 'Tests 5 & 6: Empty & Invalid Input Guards',
    description: 'Rejects empty datasets, NaN, and infinite values cleanly',
    passed: !t5Empty.isValid && !t6Nan.isValid && minMaxDivideAndConquer([]) === null,
    details: `Empty Guard: "${t5Empty.error}" · NaN Guard: Active`,
  });

  // Test 7: Odd number of readings (15 records)
  const t7Input: AnalyzedReading[] = ODD_SAMPLE_READINGS.map((r, i) => ({
    ...r,
    filteredPosition: i + 1,
  }));
  const t7DAC = minMaxDivideAndConquer(t7Input);
  const t7Lin = minMaxLinear(t7Input);
  const t7Pass =
    !!t7DAC &&
    !!t7Lin &&
    t7DAC.minimum.id === t7Lin.minimum.id &&
    t7DAC.maximum.id === t7Lin.maximum.id &&
    t7Lin.comparisons === 28;
  results.push({
    id: 'test-7',
    name: 'Test 7: Odd Number of Readings (15 Records)',
    description: 'Asymmetric recursive splits match linear baseline exactly',
    passed: t7Pass,
    details: `Min: ${t7DAC?.minimum.temperature.toFixed(1)}°C, Max: ${t7DAC?.maximum.temperature.toFixed(1)}°C · D&C Comps: ${t7DAC?.comparisons} · Linear Comps: ${t7Lin?.comparisons}`,
    sampleReadings: ODD_SAMPLE_READINGS,
  });

  // Test 8: Even number of readings (16 records)
  const t8Input: AnalyzedReading[] = DEFAULT_SAMPLE_READINGS.map((r, i) => ({
    ...r,
    filteredPosition: i + 1,
  }));
  const t8DAC = minMaxDivideAndConquer(t8Input);
  const t8Lin = minMaxLinear(t8Input);
  const t8Pass =
    !!t8DAC &&
    !!t8Lin &&
    t8DAC.minimum.id === t8Lin.minimum.id &&
    t8DAC.maximum.id === t8Lin.maximum.id &&
    t8DAC.comparisons === 22 &&
    t8Lin.comparisons === 30;
  results.push({
    id: 'test-8',
    name: 'Test 8: Even Number of Readings (16 Records)',
    description: 'Balanced power-of-two recursive splits (3n/2 - 2 = 22 comparisons)',
    passed: t8Pass,
    details: `Min: ${t8DAC?.minimum.temperature.toFixed(1)}°C, Max: ${t8DAC?.maximum.temperature.toFixed(1)}°C · D&C Comps: ${t8DAC?.comparisons} · Linear Comps: ${t8Lin?.comparisons}`,
    sampleReadings: DEFAULT_SAMPLE_READINGS,
  });

  // Test 9: Date filtering preserves original unfiltered position
  const t9Filter = filterReadingsByDateRange(DEFAULT_SAMPLE_READINGS, '2026-01-04', '2026-01-12');
  const t9DAC = minMaxDivideAndConquer(t9Filter.filtered);
  const t9Pass =
    t9Filter.error === null &&
    t9Filter.filtered.length === 9 &&
    t9DAC?.minimum.originalPosition === 5 &&
    t9DAC?.maximum.originalPosition === 12;
  results.push({
    id: 'test-9',
    name: 'Test 9: Inclusive Date Filtering & Position Preservation',
    description: 'Range 2026-01-04 to 2026-01-12 preserves unfiltered positions (#5 and #12)',
    passed: t9Pass,
    details: `Filtered: ${t9Filter.filtered.length} records · Coldest at Original Pos #${t9DAC?.minimum.originalPosition} · Hottest at Original Pos #${t9DAC?.maximum.originalPosition}`,
  });

  // Test 10: CSV Import parser validation
  const validCSV = parseTemperatureCSV('date,temperature\n2026-01-01,18.5\n2026-01-02,-4.2');
  const invalidCSV = parseTemperatureCSV('2026-01-01,not_a_number');
  const t10Pass =
    validCSV.error === null &&
    validCSV.readings.length === 2 &&
    validCSV.readings[1].temperature === -4.2 &&
    invalidCSV.error !== null;
  results.push({
    id: 'test-10',
    name: 'Test 10: Local CSV Parser & Validation',
    description: 'Parses valid date,temperature rows and rejects malformed CSV data',
    passed: t10Pass,
    details: `Valid CSV rows parsed: ${validCSV.readings.length} · Invalid CSV rejected with helpful message`,
  });

  return results;
}
