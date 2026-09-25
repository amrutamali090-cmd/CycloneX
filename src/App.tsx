import React, { useState } from 'react';
import { SCENARIOS } from './data/mockScenarios';
import { CycloneScenario, InfrastructureAsset, AssetType, SimulationParams } from './types/cyclone';
import { GeneratedAIAnalysis } from './services/geminiService';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { CycloneScenarioHeader } from './components/CycloneScenarioHeader';
import { ImpactSummaryCard } from './components/ImpactSummaryCard';
import { InfrastructureAtRiskCard } from './components/InfrastructureAtRiskCard';
import { ImpactMap } from './components/Map/ImpactMap';
import { ScenarioLab } from './components/ScenarioLab';
import { TimeMachine } from './components/TimeMachine';
import { ProtectFirstPanel } from './components/ProtectFirstPanel';
import { AIRiskAnalysisPanel } from './components/AIRiskAnalysisPanel';
import { AIActionPlanPanel } from './components/AIActionPlanPanel';
import { SatelliteViewWidget } from './components/SatelliteViewWidget';
import { AllAssetsModal } from './components/Modals/AllAssetsModal';
import { AIDeepAnalysisModal } from './components/Modals/AIDeepAnalysisModal';
import { ExportReportModal } from './components/Modals/ExportReportModal';
import { SettingsModal } from './components/Modals/SettingsModal';

export default function App() {
  const [currentScenario, setCurrentScenario] = useState<CycloneScenario>(SCENARIOS[0]);
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  // Simulation parameters state
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    windSpeed: currentScenario.maxWindsKmh,
    rainfall: currentScenario.rainfallMm,
    trackDeviationKm: 12,
    forwardSpeedKmh: 18,
    isSimulated: false,
  });

  const [isSimulating, setIsSimulating] = useState(false);

  // TimeMachine state
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(1); // T - 6h

  // Filters & Focus
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string | null>(null);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
  const [focusedAsset, setFocusedAsset] = useState<InfrastructureAsset | null>(null);

  // Modals
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Dynamic AI State
  const [dynamicAIAnalysis, setDynamicAIAnalysis] = useState<GeneratedAIAnalysis | null>(null);

  // Settings
  const [windUnit, setWindUnit] = useState<'km/h' | 'knots'>('km/h');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sound synthesizer for radar/simulation clicks
  const playAlertSound = (type: 'beep' | 'sim' = 'beep') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'sim') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch {
      // AudioContext may be restricted by browser policy before first interaction
    }
  };

  // Scenario Switcher
  const handleSelectScenario = (sc: CycloneScenario) => {
    setCurrentScenario(sc);
    setSimulationParams({
      windSpeed: sc.maxWindsKmh,
      rainfall: sc.rainfallMm,
      trackDeviationKm: 12,
      forwardSpeedKmh: 18,
      isSimulated: false,
    });
    setDynamicAIAnalysis(null);
    setActiveMilestoneIndex(1);
    playAlertSound('beep');
  };

  // Trigger Simulation Compute
  const handleRunSimulation = () => {
    setIsSimulating(true);
    playAlertSound('sim');

    setTimeout(() => {
      setSimulationParams((prev) => ({
        ...prev,
        isSimulated: true,
      }));
      setIsSimulating(false);
    }, 700);
  };

  // Handle milestone selection from TimeMachine
  const currentMilestone = currentScenario.milestones[activeMilestoneIndex] || currentScenario.milestones[0];

  // Tab switching behavior
  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    playAlertSound('beep');
    if (tab === 'infrastructure') {
      setIsAssetsModalOpen(true);
    } else if (tab === 'ai-analysis') {
      setIsAIModalOpen(true);
    } else if (tab === 'simulation') {
      // scroll to simulation lab smoothly
      const labEl = document.getElementById('scenario-lab-section');
      labEl?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'impact') {
      setSelectedRiskFilter('high');
    } else if (tab === 'track') {
      setSelectedRiskFilter(null);
      setSelectedAssetType(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] select-none">
      {/* Top Header */}
      <Header
        currentScenario={currentScenario}
        onSelectScenario={handleSelectScenario}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Bar */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* Dashboard Work Area */}
        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-w-0">
          {/* Cyclone Scenario Header Strip */}
          <CycloneScenarioHeader
            scenario={currentScenario}
            simulationParams={simulationParams}
            hoursRemaining={currentMilestone.hoursFromLandfall}
          />

          {/* Three-Column Dashboard Grid */}
          <div className="p-3.5 lg:p-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Left Column: Impact Summary & Infrastructure at Risk */}
            <div className="xl:col-span-3 flex flex-col gap-4">
              <ImpactSummaryCard
                scenario={currentScenario}
                simulationParams={simulationParams}
                selectedRiskFilter={selectedRiskFilter}
                onSelectRiskFilter={setSelectedRiskFilter}
              />

              <InfrastructureAtRiskCard
                scenario={currentScenario}
                simulationParams={simulationParams}
                selectedAssetType={selectedAssetType}
                onSelectAssetType={setSelectedAssetType}
                onOpenAllAssets={() => setIsAssetsModalOpen(true)}
              />
            </div>

            {/* Center Stage: Interactive Map & Simulator Controls */}
            <div className="xl:col-span-6 flex flex-col gap-4 min-w-0">
              {/* Interactive Impact Map */}
              <div className="rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl h-[470px] lg:h-[510px] relative">
                <ImpactMap
                  scenario={currentScenario}
                  simulationParams={simulationParams}
                  selectedRiskFilter={selectedRiskFilter}
                  selectedAssetType={selectedAssetType}
                  focusedAsset={focusedAsset}
                  currentMilestoneLat={currentMilestone.lat}
                  currentMilestoneLng={currentMilestone.lng}
                />
              </div>

              {/* Scenario Lab (What-If Simulator) */}
              <div id="scenario-lab-section">
                <ScenarioLab
                  scenario={currentScenario}
                  simulationParams={simulationParams}
                  onUpdateParams={setSimulationParams}
                  onRunSimulation={handleRunSimulation}
                  isSimulating={isSimulating}
                />
              </div>

              {/* Time Machine Scrubber */}
              <TimeMachine
                milestones={currentScenario.milestones}
                activeMilestoneIndex={activeMilestoneIndex}
                onSelectMilestone={setActiveMilestoneIndex}
              />
            </div>

            {/* Right Column: Protect First, AI Risk Analysis, AI Action Plan, Satellite Globe */}
            <div className="xl:col-span-3 flex flex-col gap-4">
              {/* Protect First Critical Assets */}
              <ProtectFirstPanel
                assets={currentScenario.assets}
                onFocusAsset={(asset) => {
                  setFocusedAsset(asset);
                  playAlertSound('beep');
                }}
                onOpenAllAssets={() => setIsAssetsModalOpen(true)}
              />

              {/* AI Risk Analysis */}
              <AIRiskAnalysisPanel
                scenario={currentScenario}
                simulationParams={simulationParams}
                onOpenAIDeepAnalysis={() => setIsAIModalOpen(true)}
                customAnalysisText={dynamicAIAnalysis?.whyAtRisk}
                confidenceScore={dynamicAIAnalysis?.confidence || currentScenario.aiAnalysis.confidence}
                isLiveAI={dynamicAIAnalysis?.isLiveAI}
              />

              {/* AI Action Plan */}
              <AIActionPlanPanel
                scenario={currentScenario}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                customActionPlan={dynamicAIAnalysis?.actionPlan}
              />

              {/* Real-time Satellite View Widget */}
              <SatelliteViewWidget />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AllAssetsModal
        assets={currentScenario.assets}
        isOpen={isAssetsModalOpen}
        onClose={() => setIsAssetsModalOpen(false)}
        onFocusAsset={(asset) => {
          setFocusedAsset(asset);
          playAlertSound('beep');
        }}
      />

      <AIDeepAnalysisModal
        scenario={currentScenario}
        simulationParams={simulationParams}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApplyNewAnalysis={(analysis) => {
          setDynamicAIAnalysis(analysis);
          playAlertSound('beep');
        }}
      />

      <ExportReportModal
        scenario={currentScenario}
        simulationParams={simulationParams}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        windUnit={windUnit}
        onToggleWindUnit={setWindUnit}
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
      />
    </div>
  );
}
