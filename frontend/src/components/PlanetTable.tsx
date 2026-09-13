import React, { useState } from 'react';
import type { ChartResult, PlanetData } from '../types';
import { Table, ChevronDown, ChevronUp } from 'lucide-react';
import { ZodiacIcon } from './ZodiacIcon';

interface PlanetTableProps {
  chart: ChartResult;
  selectedPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
}

export const PlanetTable: React.FC<PlanetTableProps> = ({
  chart,
  selectedPlanet,
  onSelectPlanet,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl dark:shadow-2xl transition-colors duration-250">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none mb-1 pb-3 border-b border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              ตารางตำแหน่งดาวและจุดสำคัญ (Planetary Positions Data Sheet)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Swiss Ephemeris JPL DE431 Precision</span>
          </div>
        </div>
        <button
          type="button"
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto mt-3 animate-in fade-in duration-150">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold bg-slate-50/80 dark:bg-slate-950/40">
                <th className="py-2.5 px-3">ดาวเคราะห์</th>
                <th className="py-2.5 px-3">ราศีที่สถิต</th>
                <th className="py-2.5 px-3 text-right">องศาละเอียด</th>
                <th className="py-2.5 px-3 text-center">เรือนชะตา</th>
                <th className="py-2.5 px-3 text-right">ความเร็ว/วัน</th>
                <th className="py-2.5 px-3 text-center">พักร์ (R)</th>
                <th className="py-2.5 px-3 text-right">Declination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {chart.planets.map((p: PlanetData) => {
                const isSelected = selectedPlanet === p.name;
                return (
                  <tr
                    key={p.name}
                    onClick={() => onSelectPlanet(isSelected ? null : p.name)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-500/10 font-medium' : ''
                    }`}
                  >
                    <td className="py-2 px-3 flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs">
                        {p.symbol}
                      </span>
                      <span>{p.thai}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">({p.name})</span>
                    </td>

                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <ZodiacIcon sign={p.sign_thai} size={14} className="text-amber-500 dark:text-amber-400 shrink-0" />
                        <span>{p.sign_thai}</span>
                      </span>
                    </td>

                    <td className="py-2 px-3 text-right font-mono font-medium text-slate-900 dark:text-slate-100">
                      {p.formatted_dms}
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-400 font-semibold text-[11px]">
                        เรือน {p.house}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                      {p.speed_str}
                    </td>

                    <td className="py-2 px-3 text-center font-bold">
                      {p.is_retrograde ? (
                        <span className="text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded text-[10px]">
                          R
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                      {p.declination_str}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
