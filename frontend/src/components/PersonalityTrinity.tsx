import React from 'react';
import { Compass, Flame, Heart, Sparkles } from 'lucide-react';
import type { TrinityData } from '../types';
import { ZodiacIcon } from './ZodiacIcon';

interface PersonalityTrinityProps {
  trinity: TrinityData;
}

export const PersonalityTrinity: React.FC<PersonalityTrinityProps> = ({ trinity }) => {
  const { sun, ascendant, moon } = trinity.personality_trinity;

  return (
    <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>แก่นอัตลักษณ์สามมิติ (Personality Trinity)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              วิเคราะห์ 3 เสาหลักแห่งตัวตน: อาทิตย์ (แก่นแท้) • ลัคนา (การแสดงออก) • จันทร์ (อารมณ์)
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid: 1 col on mobile, 3 cols on full-width tablet/laptop, 1 col when stacked in hero sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-4">
        {/* 1. Sun (แก่นแท้เจตจำนง) */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-amber-500/25 hover:border-amber-500/50 rounded-xl p-4 transition-all relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                ☉
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  แก่นแท้ & เจตจำนง (Sun)
                </span>
              </div>
            </div>
            {sun.dignity && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                {sun.dignity}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <ZodiacIcon sign={sun.title} size={16} className="text-amber-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{sun.title}</h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{sun.subtitle}</p>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            {sun.core_nature}
          </p>

          <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>{sun.house_theme}</span>
          </div>
        </div>

        {/* 2. Ascendant (บุคลิกภาพและการแสดงออก) */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-sky-500/25 hover:border-sky-500/50 rounded-xl p-4 transition-all relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                AC
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                  การแสดงออก & ภาพลักษณ์ (Ascendant)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <ZodiacIcon sign={ascendant.title} size={16} className="text-sky-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ascendant.title}</h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{ascendant.subtitle}</p>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            {ascendant.outward_persona}
          </p>

          <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-sky-700 dark:text-sky-300 flex items-start gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
            <span>{ascendant.ruler_placement}</span>
          </div>
        </div>

        {/* 3. Moon (อารมณ์และความต้องการภายใน) */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-indigo-500/25 hover:border-indigo-500/50 rounded-xl p-4 transition-all relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                ☽
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  อารมณ์ & จิตใต้สำนึก (Moon)
                </span>
              </div>
            </div>
            {moon.dignity && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold">
                {moon.dignity}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <ZodiacIcon sign={moon.title} size={16} className="text-indigo-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{moon.title}</h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{moon.subtitle}</p>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            {moon.emotional_instinct}
          </p>

          <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-start gap-1.5">
            <Heart className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>{moon.house_theme}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
