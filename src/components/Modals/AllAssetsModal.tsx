import React, { useState } from 'react';
import { InfrastructureAsset, AssetType } from '../../types/cyclone';
import { X, Search, Filter, Download, Crosshair, PlusSquare, Zap, AlertTriangle, Users } from 'lucide-react';

interface AllAssetsModalProps {
  assets: InfrastructureAsset[];
  isOpen: boolean;
  onClose: () => void;
  onFocusAsset: (asset: InfrastructureAsset) => void;
}

export const AllAssetsModal: React.FC<AllAssetsModalProps> = ({
  assets,
  isOpen,
  onClose,
  onFocusAsset,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [vulnFilter, setVulnFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.impactRisk.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesVuln = vulnFilter === 'all' || asset.vulnerability === vulnFilter;
    return matchesSearch && matchesType && matchesVuln;
  });

  const exportCSV = () => {
    const headers = ['Name', 'Type', 'Vulnerability', 'HoursToImpact', 'ElevationMeters', 'BackupPower', 'Capacity', 'ImpactRisk', 'Action'];
    const rows = filtered.map((a) => [
      `"${a.name}"`,
      `"${a.type}"`,
      `"${a.vulnerability}"`,
      a.timeToImpactHours,
      a.elevationMeters,
      `"${a.backupPowerStatus}"`,
      `"${a.capacityOrLoad}"`,
      `"${a.impactRisk}"`,
      `"${a.recommendedAction}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cyclonex_infrastructure_inventory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-[#090f1f] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white font-['Chakra_Petch']">
              Critical Infrastructure Vulnerability Registry
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive inventory of monitored hospitals, energy nodes, roads, and settlements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search asset, risk, or locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Type Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['all', 'hospital', 'power', 'road', 'population'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  typeFilter === t
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Vulnerability Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400 mr-1">Risk:</span>
            {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((v) => (
              <button
                key={v}
                onClick={() => setVulnFilter(v)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                  vulnFilter === v
                    ? 'bg-slate-800 text-white font-bold border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-2 px-3">Asset</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Vulnerability</th>
                <th className="py-2 px-3">ETA Impact</th>
                <th className="py-2 px-3">Backup Power</th>
                <th className="py-2 px-3">Capacity / Load</th>
                <th className="py-2 px-3">Primary Action</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-white">{asset.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{asset.impactRisk}</div>
                  </td>
                  <td className="py-2.5 px-3 capitalize text-slate-300 font-mono">
                    {asset.type}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        asset.vulnerability === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : asset.vulnerability === 'HIGH'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-900'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-900'
                      }`}
                    >
                      {asset.vulnerability}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-rose-400">
                    {asset.timeToImpactHours} hrs
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span
                      className={
                        asset.backupPowerStatus === 'Operational'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }
                    >
                      {asset.backupPowerStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {asset.capacityOrLoad}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-xs leading-tight">
                    {asset.recommendedAction}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        onFocusAsset(asset);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 hover:border-cyan-700 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Locate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filtered.length}</strong> of{' '}
            {assets.length} monitored infrastructure nodes
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
};
