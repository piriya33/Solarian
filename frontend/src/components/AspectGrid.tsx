import React, { useState } from 'react';
import type { ChartResult, HouseData, AspectDynamic } from '../types';
import { Layers, Network, Sparkles, ChevronDown, ChevronUp, ShieldAlert, Briefcase, Heart, Brain, Zap } from 'lucide-react';
import { ZodiacIcon } from './ZodiacIcon';

interface AspectGridProps {
  chart: ChartResult;
  aspectDynamics?: AspectDynamic[];
  selectedPlanet: string | null;
  onSelectPlanet?: (name: string | null) => void;
}

export const AspectGrid: React.FC<AspectGridProps> = ({
  chart,
  aspectDynamics = [],
  selectedPlanet,
  onSelectPlanet,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'exact' | 'close' | 'harmony' | 'hard' | 'conjunction'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First card expanded by default

  // Filter dynamics
  let filteredDynamics = aspectDynamics;

  if (selectedPlanet) {
    filteredDynamics = filteredDynamics.filter(
      (a) => a.body1 === selectedPlanet || a.body2 === selectedPlanet
    );
  }

  if (filterType === 'exact') {
    filteredDynamics = filteredDynamics.filter((a) => a.potency_badge === 'exact');
  } else if (filterType === 'close') {
    filteredDynamics = filteredDynamics.filter((a) => a.potency_badge === 'close' || a.potency_badge === 'exact');
  } else if (filterType === 'harmony') {
    filteredDynamics = filteredDynamics.filter((a) => ['Trine', 'Sextile'].includes(a.aspect_name));
  } else if (filterType === 'hard') {
    filteredDynamics = filteredDynamics.filter((a) => ['Square', 'Opposition'].includes(a.aspect_name));
  } else if (filterType === 'conjunction') {
    filteredDynamics = filteredDynamics.filter((a) => a.aspect_name === 'Conjunction');
  }

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* 1. Placidus Houses Table (4 cols on xl) */}
      <div className="xl:col-span-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xl dark:shadow-2xl transition-colors duration-250">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                ขอบเรือนชะตา (Placidus Cusps)
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">12 ภพเรือนชะตากำเนิด</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">ระบบ Placidus</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold bg-slate-50/80 dark:bg-slate-950/50">
                <th className="py-2 px-2.5">เรือน</th>
                <th className="py-2 px-2.5">ความหมาย</th>
                <th className="py-2 px-2.5">ราศี</th>
                <th className="py-2 px-2.5 text-right">องศา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {chart.houses.map((h: HouseData) => {
                const isAngle = [1, 4, 7, 10].includes(h.house);
                return (
                  <tr
                    key={h.house}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isAngle ? 'bg-sky-50/70 dark:bg-sky-950/20 font-medium' : ''
                    }`}
                  >
                    <td className="py-1.5 px-2.5 flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isAngle ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {h.house}
                      </span>
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-700 dark:text-slate-300 text-[11px]">
                      {h.name_thai.split(' - ')[1]?.replace(')', '') || h.name_thai}
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-700 dark:text-slate-300 text-[11px]">
                      <div className="flex items-center gap-1">
                        <ZodiacIcon sign={h.sign_thai} size={14} className="text-amber-500 dark:text-amber-400 shrink-0" />
                        <span>{h.sign_thai}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono text-slate-900 dark:text-slate-200 text-[11px]">
                      {h.formatted_dms.split(' ')[1] || h.formatted_dms}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Deep Aspect & Degree Dynamics Analyzer (8 cols on xl) */}
      <div className="xl:col-span-8 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xl dark:shadow-2xl transition-colors duration-250">
        {/* Header & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>ระบบวิเคราะห์คู่องศาดาวและมุมสัมพันธ์เชิงลึก (Aspect Dynamics)</span>
                <span className="text-xs bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded-full font-mono">
                  {aspectDynamics.length} คู่มุม
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ผสานหลักโหราศาสตร์สากล (องศา Orb) + โหราศาสตร์ไทย (คู่มิตร, คู่สมพล, คู่ศัตรู, คู่ธาตุ)
              </p>
            </div>
          </div>

          {selectedPlanet && (
            <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <span>แสดงเฉพาะ: <b>{selectedPlanet}</b></span>
              {onSelectPlanet && (
                <button
                  type="button"
                  onClick={() => onSelectPlanet(null)}
                  className="text-[10px] bg-amber-500/30 hover:bg-amber-500/50 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                >
                  ล้าง
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800/60 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] mr-1">ระดับอิทธิพล:</span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            ทั้งหมด ({aspectDynamics.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('exact')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              filterType === 'exact'
                ? 'bg-emerald-500 text-white font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            เข้มข้นสูงสุด (Orb ≤ 1°)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('close')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              filterType === 'close'
                ? 'bg-sky-500 text-white font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            เด่นชัด (Orb ≤ 3°)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('conjunction')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              filterType === 'conjunction'
                ? 'bg-indigo-500 text-white font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            กุมสนิท (0°)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('harmony')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              filterType === 'harmony'
                ? 'bg-blue-500 text-white font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            ตรีโกณ / โยค (120° / 60°)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('hard')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              filterType === 'hard'
                ? 'bg-rose-500 text-white font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            ฉาก / เล็ง (90° / 180°)
          </button>
        </div>

        {/* Dynamic Aspect Cards List */}
        <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
          {filteredDynamics.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
              ไม่พบมุมสัมพันธ์ในเงื่อนไขการกรองนี้
            </div>
          ) : (
            filteredDynamics.map((ad, idx) => {
              const isExpanded = expandedIndex === idx;
              const isHarmony = ['Trine', 'Sextile'].includes(ad.aspect_name);
              const isHard = ['Square', 'Opposition'].includes(ad.aspect_name);

              return (
                <div
                  key={`${ad.body1}-${ad.body2}-${ad.aspect_name}-${idx}`}
                  className="bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl overflow-hidden transition-all shadow-sm"
                >
                  {/* Card Header (Always Visible) */}
                  <div
                    onClick={() => toggleExpand(idx)}
                    className="p-3.5 flex flex-wrap items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    {/* Left: Planetary Bodies & Aspect Symbol */}
                    <div className="flex items-center gap-3">
                      {/* Body 1 */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPlanet && onSelectPlanet(ad.body1);
                        }}
                        className="flex items-center gap-1.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1 rounded-lg hover:border-amber-500 transition-colors cursor-pointer shadow-sm"
                        title={`คลิกเพื่อไฮไลท์ ${ad.body1_thai} บนวงล้อ`}
                      >
                        <span className="text-amber-500 dark:text-amber-400 font-bold text-sm">{ad.body1_symbol}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{ad.body1_thai}</span>
                      </div>

                      {/* Aspect Glyphs */}
                      <div className="flex flex-col items-center px-1">
                        <span
                          className={`font-bold text-base leading-none ${
                            isHarmony ? 'text-blue-500 dark:text-blue-400' : isHard ? 'text-rose-500 dark:text-rose-400' : 'text-amber-500 dark:text-amber-400'
                          }`}
                        >
                          {ad.aspect_symbol}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {ad.aspect_thai} ({Math.round(ad.aspect_angle)}°)
                        </span>
                      </div>

                      {/* Body 2 */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPlanet && onSelectPlanet(ad.body2);
                        }}
                        className="flex items-center gap-1.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1 rounded-lg hover:border-amber-500 transition-colors cursor-pointer shadow-sm"
                        title={`คลิกเพื่อไฮไลท์ ${ad.body2_thai} บนวงล้อ`}
                      >
                        <span className="text-amber-500 dark:text-amber-400 font-bold text-sm">{ad.body2_symbol}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{ad.body2_thai}</span>
                      </div>
                    </div>

                    {/* Middle: Badges (Potency + Thai Pair) */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Thai Pair Badge */}
                      {ad.thai_pair_info && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            ad.thai_pair_info.nature === 'positive'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                              : ad.thai_pair_info.nature === 'negative'
                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {ad.thai_pair_info.type}
                        </span>
                      )}

                      {/* Potency Meter Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border flex items-center gap-1 ${
                          ad.potency_badge === 'exact'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                            : ad.potency_badge === 'close'
                            ? 'bg-sky-500/20 border-sky-500/40 text-sky-800 dark:text-sky-300'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                        <span>{ad.potency_score}%</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-normal">({ad.orb_str})</span>
                      </span>

                      {/* Chevron Toggle */}
                      <button
                        type="button"
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors ml-1 shadow-sm"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary Dynamic Bar */}
                  <div className="px-3.5 pb-3 pt-0 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-medium">
                      <span className="text-amber-700 dark:text-amber-300 font-semibold">{ad.pair_title}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">{ad.applying_text}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 leading-relaxed">
                      {ad.core_dynamic}
                    </p>
                  </div>

                  {/* Expandable Deep Synthesis Breakdown */}
                  {isExpanded && (
                    <div className="px-3.5 pb-4 pt-2 border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 space-y-3 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* 1. Psychology */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="flex items-center gap-1.5 font-bold text-sky-700 dark:text-sky-300 mb-1.5">
                            <Brain className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                            <span>จิตวิทยาและอุปนิสัยลึกๆ</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                            {ad.psychology}
                          </p>
                        </div>

                        {/* 2. Career */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300 mb-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                            <span>การงาน ทรัพย์สิน และเป้าหมาย</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                            {ad.career}
                          </p>
                        </div>

                        {/* 3. Relationships */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300 mb-1.5">
                            <Heart className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                            <span>ความรักและมิตรภาพ</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                            {ad.relationships}
                          </p>
                        </div>

                        {/* 4. Challenges */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400 mb-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                            <span>จุดเปราะบาง / ความท้าทาย</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                            {ad.challenges}
                          </p>
                        </div>
                      </div>

                      {/* 5. Actionable Empowerment Strategy */}
                      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/30 text-xs shadow-sm">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-200 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <span>กลยุทธ์การปรับใช้พลังให้เกิดประโยชน์สูงสุด (Empowerment Strategy)</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed">
                          {ad.empowerment}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
