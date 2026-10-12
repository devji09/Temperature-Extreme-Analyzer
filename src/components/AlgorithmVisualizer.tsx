import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Scissors,
  Combine,
} from 'lucide-react';
import {
  AnalyzedReading,
  buildRecursionSteps,
  RecursionNodeData,
  RecursionStep,
  formatShortDateLabel,
} from '../utils/temperatureAlgorithms';

interface AlgorithmVisualizerProps {
  analyzedReadings: AnalyzedReading[];
}

export const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({
  analyzedReadings,
}) => {
  const vizData = useMemo(
    () => buildRecursionSteps(analyzedReadings),
    [analyzedReadings]
  );

  const totalSteps = vizData ? vizData.steps.length : 0;
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(
    totalSteps > 0 ? totalSteps - 1 : 0
  );
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset to final completed step whenever dataset changes
  useEffect(() => {
    setIsPlaying(false);
    if (vizData && vizData.steps.length > 0) {
      setCurrentStepIdx(vizData.steps.length - 1);
    } else {
      setCurrentStepIdx(0);
    }
  }, [vizData]);

  // Auto-play timer when visualization is playing
  useEffect(() => {
    if (!isPlaying || !vizData) return;
    if (currentStepIdx >= vizData.steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setCurrentStepIdx((prev) => Math.min(prev + 1, vizData.steps.length - 1));
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [isPlaying, currentStepIdx, vizData]);

  if (!vizData || analyzedReadings.length === 0) {
    return null;
  }

  const currentStep: RecursionStep =
    vizData.steps[currentStepIdx] || vizData.steps[vizData.steps.length - 1];
  const isFinalStep = currentStepIdx === vizData.steps.length - 1;

  const handleStartVisualization = () => {
    if (currentStepIdx >= vizData.steps.length - 1) {
      setCurrentStepIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => Math.min(prev + 1, vizData.steps.length - 1));
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (nodeId: string): React.ReactNode => {
    const node: RecursionNodeData | undefined = vizData.nodes[nodeId];
    if (!node) return null;

    const isResolved = Boolean(currentStep.resolvedNodes[nodeId]);
    const isActive = currentStep.activeNodeIds.includes(nodeId);
    const isPrimaryFocus = currentStep.nodeId === nodeId;
    const isComparingChild = currentStep.comparingChildrenIds?.includes(nodeId) ?? false;
    const isRootComplete = isFinalStep && nodeId === vizData.rootNodeId;

    const resolvedInfo = currentStep.resolvedNodes[nodeId];

    const rangeLabel =
      node.low === node.high
        ? `Record [${node.low + 1}]`
        : node.low === 0 && node.high === analyzedReadings.length - 1
        ? `All Readings [1..${node.high + 1}]`
        : `Range [${node.low + 1}..${node.high + 1}]`;

    return (
      <div key={nodeId} className="flex flex-col items-center">
        {/* Node Card */}
        <motion.div
          layout="position"
          initial={{ opacity: 0.7, scale: 0.98 }}
          animate={{
            opacity: isResolved || isActive ? 1 : 0.45,
            scale: isPrimaryFocus ? 1.02 : 1,
          }}
          transition={{ duration: 0.18 }}
          onClick={() => {
            // Find the step where this node is resolved or divided
            const targetIdx = vizData.steps.findIndex(
              (s) => s.nodeId === nodeId && s.type !== 'DIVIDE'
            );
            if (targetIdx !== -1) {
              setIsPlaying(false);
              setCurrentStepIdx(targetIdx);
            }
          }}
          className={`w-48 sm:w-52 rounded-xl p-3 border text-left transition-colors cursor-pointer select-none ${
            isRootComplete
              ? 'bg-[#FFFDF7] border-[#67866A] ring-2 ring-[#67866A]/25'
              : isPrimaryFocus
              ? 'bg-[#FFFDF7] border-[#E58A45] ring-2 ring-[#E58A45]/25'
              : isComparingChild
              ? 'bg-[#FFFDF7] border-[#4C91C7] ring-1 ring-[#4C91C7]/30'
              : isResolved
              ? 'bg-[#FFFDF7] border-[#E8E2D6] hover:border-[#252820]/30'
              : 'bg-[#F8F5EC] border-[#E8E2D6]/80'
          }`}
        >
          {/* Node Header: Range & Comparison Badge */}
          <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-[#E8E2D6]">
            <span className="font-mono text-[11px] font-semibold text-[#252820] tabular-nums truncate">
              {rangeLabel}
            </span>
            <span className="font-mono text-[10px] text-[#77776B] tabular-nums shrink-0">
              {isResolved
                ? `${resolvedInfo.localComparisons} ${
                    resolvedInfo.localComparisons === 1 ? 'comp' : 'comps'
                  }`
                : node.isBaseCase
                ? 'Base'
                : `mid=${(node.mid ?? 0) + 1}`}
            </span>
          </div>

          {/* Node Body: Local Min & Max or Pending Status */}
          {isResolved ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] text-[#77776B]">Min:</span>
                <div className="text-right font-mono tabular-nums">
                  <span className="font-semibold text-[#4C91C7]">
                    {resolvedInfo.minimum.temperature.toFixed(1)}°C
                  </span>
                  <span className="text-[10px] text-[#77776B] ml-1">
                    ({formatShortDateLabel(resolvedInfo.minimum.date)})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] text-[#77776B]">Max:</span>
                <div className="text-right font-mono tabular-nums">
                  <span className="font-semibold text-[#E46F55]">
                    {resolvedInfo.maximum.temperature.toFixed(1)}°C
                  </span>
                  <span className="text-[10px] text-[#77776B] ml-1">
                    ({formatShortDateLabel(resolvedInfo.maximum.date)})
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-2 text-center">
              <p className="text-[11px] text-[#77776B] font-mono">
                {isActive
                  ? `Splitting at #${(node.mid ?? 0) + 1}...`
                  : 'Awaiting recursion'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Children Branches */}
        {node.leftId && node.rightId && (
          <div className="flex flex-col items-center">
            {/* Vertical stem from parent */}
            <div className="w-px h-4 bg-[#E8E2D6]" />

            {/* Horizontal connector bar + child columns */}
            <div className="relative flex items-start gap-4 sm:gap-6 pt-4">
              {/* Top horizontal bridge */}
              <div className="absolute top-0 left-1/4 right-1/4 h-px bg-[#E8E2D6]" />
              <div className="absolute top-0 left-1/4 w-px h-4 bg-[#E8E2D6]" />
              <div className="absolute top-0 right-1/4 w-px h-4 bg-[#E8E2D6]" />

              <div className="flex flex-col items-center">
                {renderTreeNode(node.leftId)}
              </div>
              <div className="flex flex-col items-center">
                {renderTreeNode(node.rightId)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      id="algorithm"
      className="py-16 md:py-24 border-b border-[#E8E2D6] scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-medium tracking-wider text-[#77776B]">
            <span>RECURSIVE EXECUTION TRACE</span>
            <span aria-hidden="true">·</span>
            <span>LIVE TREE VISUALIZER</span>
          </div>
          <h2
            className="font-serif text-3xl sm:text-4xl font-semibold text-[#252820] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            See How Divide and Conquer Works
          </h2>
          <p className="text-sm sm:text-base text-[#77776B]">
            One large problem becomes smaller problems, until every reading can be compared efficiently.
          </p>
        </div>

        {/* Interactive Control Bar */}
        <div className="bg-[#FFFDF7] border border-[#E8E2D6] rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E8E2D6]">
            {/* Playback Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleStartVisualization}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#FFFDF7] bg-[#E58A45] hover:bg-[#d37935] rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#252820]"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Visualization</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Visualization</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIdx === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#252820] bg-[#F8F5EC] hover:bg-[#EFE9DA] disabled:opacity-40 disabled:pointer-events-none border border-[#E8E2D6] rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={currentStepIdx >= totalSteps - 1}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#252820] bg-[#F8F5EC] hover:bg-[#EFE9DA] disabled:opacity-40 disabled:pointer-events-none border border-[#E8E2D6] rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#77776B] hover:text-[#252820] bg-[#F8F5EC] hover:bg-[#EFE9DA] border border-[#E8E2D6] rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Step Counter & Cumulative Comparisons */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
              <div className="font-mono tabular-nums text-[#252820] font-semibold">
                Step {currentStep.stepNumber} of {totalSteps}
              </div>
              <span className="text-[#77776B]" aria-hidden="true">·</span>
              <div className="font-mono tabular-nums text-[#77776B]">
                Comparisons so far:{' '}
                <span className="font-semibold text-[#E58A45]">
                  {currentStep.cumulativeComparisons}
                </span>
              </div>
            </div>
          </div>

          {/* Step Scrubber Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#77776B]">
              <label htmlFor="recursion-step-slider" className="font-medium text-[#252820]">
                Interactive Execution Timeline: {currentStep.title}
              </label>
              <span className="font-mono tabular-nums">
                {Math.round(((currentStepIdx + 1) / totalSteps) * 100)}% complete
              </span>
            </div>
            <input
              id="recursion-step-slider"
              type="range"
              min={0}
              max={Math.max(0, totalSteps - 1)}
              value={currentStepIdx}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentStepIdx(Number(e.target.value));
              }}
              className="w-full accent-[#E58A45] cursor-pointer h-1.5 bg-[#F8F5EC] rounded-lg"
            />
          </div>

          {/* Active Subrange Array Strip Inspector */}
          <div className="p-4 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#252820]">
                Active Array Partitioning ([1..{analyzedReadings.length}])
              </span>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#77776B]">
                {currentStep.type === 'DIVIDE' && currentStep.mid !== undefined ? (
                  <>
                    <span className="text-[#4C91C7] font-medium">
                      Left Half [{currentStep.low + 1}..{currentStep.mid + 1}]
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#E58A45] font-medium">
                      Right Half [{currentStep.mid + 2}..{currentStep.high + 1}]
                    </span>
                  </>
                ) : (
                  <span>
                    Active Range: [{currentStep.low + 1}..{currentStep.high + 1}]
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
              {analyzedReadings.map((reading, idx) => {
                const inRange = idx >= currentStep.low && idx <= currentStep.high;
                const isLeftSub =
                  inRange &&
                  currentStep.mid !== undefined &&
                  idx <= currentStep.mid;
                const isRightSub =
                  inRange &&
                  currentStep.mid !== undefined &&
                  idx > currentStep.mid;
                const isMidpointBoundary =
                  inRange &&
                  currentStep.mid !== undefined &&
                  idx === currentStep.mid;

                return (
                  <React.Fragment key={reading.id}>
                    <div
                      className={`min-w-[68px] px-2.5 py-2 rounded-lg border text-center transition-all shrink-0 ${
                        !inRange
                          ? 'bg-[#FFFDF7]/50 border-[#E8E2D6]/60 opacity-40'
                          : isLeftSub
                          ? 'bg-[#4C91C7]/10 border-[#4C91C7] text-[#252820]'
                          : isRightSub
                          ? 'bg-[#E58A45]/12 border-[#E58A45] text-[#252820]'
                          : 'bg-[#FFFDF7] border-[#252820] text-[#252820]'
                      }`}
                    >
                      <div className="font-mono text-[10px] text-[#77776B] tabular-nums">
                        #{reading.originalPosition}
                      </div>
                      <div className="font-mono text-xs font-semibold tabular-nums">
                        {reading.temperature.toFixed(1)}°C
                      </div>
                      <div className="text-[10px] text-[#77776B] truncate">
                        {formatShortDateLabel(reading.date)}
                      </div>
                    </div>

                    {isMidpointBoundary && (
                      <div
                        className="flex flex-col items-center px-1 text-[#E58A45] shrink-0"
                        title={`Midpoint split after index ${idx + 1}`}
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span className="font-mono text-[9px]">mid</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Current Step Explanation & Animated Comparison Callout */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.stepNumber}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="p-4 sm:p-5 rounded-xl bg-[#F8F5EC] border border-[#E8E2D6] space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#E58A45]">
                    {currentStep.type === 'DIVIDE' && <Scissors className="w-4 h-4" />}
                    {(currentStep.type === 'BASE_ONE' || currentStep.type === 'BASE_TWO') && (
                      <GitBranch className="w-4 h-4" />
                    )}
                    {currentStep.type === 'COMBINE' && <Combine className="w-4 h-4" />}
                    <span>
                      {currentStep.type === 'DIVIDE'
                        ? 'RECURSIVE DIVIDE STEP'
                        : currentStep.type === 'BASE_ONE'
                        ? 'BASE CASE · 1 ELEMENT'
                        : currentStep.type === 'BASE_TWO'
                        ? 'BASE CASE · 2 ELEMENTS'
                        : 'COMBINE & COMPARE STEP'}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#252820]">
                    {currentStep.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#77776B] leading-relaxed">
                    {currentStep.description}
                  </p>
                </div>

                <div className="font-mono text-xs bg-[#FFFDF7] border border-[#E8E2D6] rounded-lg px-3 py-2 tabular-nums shrink-0">
                  <span className="text-[#77776B]">Step Comparisons: </span>
                  <span className="font-semibold text-[#252820]">
                    +{currentStep.comparisonsAdded}
                  </span>
                </div>
              </div>

              {/* Detailed Comparison Cards when Base-2 or Combine step occurs */}
              {currentStep.minComparisonDetail && currentStep.maxComparisonDetail && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#E8E2D6]">
                  {/* Minimum Comparison Box */}
                  <div className="p-3 rounded-lg bg-[#FFFDF7] border border-[#E8E2D6] flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-[#4C91C7] block">
                        Minimum Comparison
                      </span>
                      <div className="font-mono tabular-nums text-[#252820] pt-0.5">
                        {currentStep.minComparisonDetail.left.temperature.toFixed(1)}°C vs{' '}
                        {currentStep.minComparisonDetail.right.temperature.toFixed(1)}°C
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#77776B] shrink-0" />
                    <div className="text-right font-mono tabular-nums">
                      <span className="text-[10px] text-[#77776B] block font-sans">
                        Smaller Wins
                      </span>
                      <span className="font-semibold text-[#4C91C7]">
                        {currentStep.minComparisonDetail.winner.temperature.toFixed(1)}°C (#
                        {currentStep.minComparisonDetail.winner.originalPosition})
                      </span>
                    </div>
                  </div>

                  {/* Maximum Comparison Box */}
                  <div className="p-3 rounded-lg bg-[#FFFDF7] border border-[#E8E2D6] flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-[#E46F55] block">
                        Maximum Comparison
                      </span>
                      <div className="font-mono tabular-nums text-[#252820] pt-0.5">
                        {currentStep.maxComparisonDetail.left.temperature.toFixed(1)}°C vs{' '}
                        {currentStep.maxComparisonDetail.right.temperature.toFixed(1)}°C
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#77776B] shrink-0" />
                    <div className="text-right font-mono tabular-nums">
                      <span className="text-[10px] text-[#77776B] block font-sans">
                        Larger Wins
                      </span>
                      <span className="font-semibold text-[#E46F55]">
                        {currentStep.maxComparisonDetail.winner.temperature.toFixed(1)}°C (#
                        {currentStep.maxComparisonDetail.winner.originalPosition})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Step Banner */}
              {isFinalStep && currentStep.resolvedNodes[vizData.rootNodeId] && (
                <div className="pt-2 border-t border-[#E8E2D6] flex flex-wrap items-center justify-between gap-2 text-xs text-[#67866A] font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Recursion complete! Global Minimum:{' '}
                      <strong className="font-mono">
                        {currentStep.resolvedNodes[vizData.rootNodeId].minimum.temperature.toFixed(
                          1
                        )}
                        °C
                      </strong>{' '}
                      · Global Maximum:{' '}
                      <strong className="font-mono">
                        {currentStep.resolvedNodes[vizData.rootNodeId].maximum.temperature.toFixed(
                          1
                        )}
                        °C
                      </strong>
                    </span>
                  </div>
                  <span className="font-mono text-[#252820]">
                    Total Temperature Comparisons: {currentStep.cumulativeComparisons}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Recursion Tree Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#77776B]">
              <span>
                Click any node in the recursion tree to jump to its resolution step.
              </span>
              <span className="font-mono">
                Tree Depth: {vizData.maxDepth + 1}{' '}
                {vizData.maxDepth + 1 === 1 ? 'level' : 'levels'}
              </span>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar bg-[#F8F5EC]/70 border border-[#E8E2D6] rounded-xl p-6">
              <div className="min-w-max mx-auto flex justify-center">
                {renderTreeNode(vizData.rootNodeId)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
