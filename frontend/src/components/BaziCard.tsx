import React, { useState } from 'react';
import type { BaziResult } from '../types';
import { Compass, Sparkles, Flame, Droplets, Mountain, Trees, Shield } from 'lucide-react';

interface BaziCardProps {
  bazi: BaziResult;
  currentAge?: number;
}

export const BaziCard: React.FC<BaziCardProps> = ({ bazi, currentAge }) => {
  const [activeTab, setActiveTab] = useState<'essence' | 'pillars' | 'career' | 'fengshui' | 'dayun'>('essence');
  const { four_pillars, day_master, five_elements_percent, true_solar_time, eot_minutes, da_yun } = bazi;


  const getElementColorClass = (element: string) => {
    switch (element) {
      case 'Wood': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      case 'Fire': return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
      case 'Earth': return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      case 'Metal': return 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700';
      case 'Water': return 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Wood': return <Trees className="w-3.5 h-3.5" />;
      case 'Fire': return <Flame className="w-3.5 h-3.5" />;
      case 'Earth': return <Mountain className="w-3.5 h-3.5" />;
      case 'Metal': return <Shield className="w-3.5 h-3.5" />;
      case 'Water': return <Droplets className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const pillarsOrder = [
    { key: 'hour', data: four_pillars.hour, title: 'เสายาม (Hour)' },
    { key: 'day', data: four_pillars.day, title: 'เสาวัน (Day / Self)' },
    { key: 'month', data: four_pillars.month, title: 'เสาเดือน (Month)' },
    { key: 'year', data: four_pillars.year, title: 'เสาปี (Year)' },
  ];

  return (
    <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in">
      {/* Header & True Solar Time Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              ระบบสี่เสาชะตาชีวิตปาจื่อ (Eastern Bazi Four Pillars)
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            พิมพ์เขียวห้าธาตุและพลังงานดวงจีน (BaZi Architecture)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            คำนวณตามสารทสุริยคติ 24 ฤดูกาล (节气) และเวลาสุริยคติแท้ (True Solar Time) จาก Swiss Ephemeris JPL DE431
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 font-medium flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>เวลาสุริยคติแท้: <b>{true_solar_time} น.</b></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            EoT: {eot_minutes > 0 ? `+${eot_minutes}` : eot_minutes} นาที
          </div>
        </div>
      </div>

      {/* The 4 Pillars Columns Grid */}
      <div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
          <span>สี่เสาชะตาชีวิต (เรียงจาก ยาม ➔ วัน ➔ เดือน ➔ ปี)</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">*เสาวัน คือ ตัวตนแท้จริง (Day Master)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pillarsOrder.map(({ key, data, title }) => {
            const isDM = key === 'day';
            return (
              <div
                key={key}
                className={`rounded-2xl p-5 border text-center relative overflow-hidden transition-all ${
                  isDM
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-md ring-1 ring-amber-400/30'
                    : 'bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 min-h-[20px]">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {title}
                  </span>
                  {isDM && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs">
                      Day Master
                    </span>
                  )}
                </div>

                {/* Heavenly Stem */}
                <div className="py-2 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-4xl font-black text-slate-900 dark:text-slate-100 block font-serif">
                    {data.stem.chinese}
                  </span>
                  <div className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {data.stem.pinyin} ({data.stem.thai})
                  </div>
                  <div className="mt-1.5 flex items-center justify-center gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1 ${getElementColorClass(data.stem.element)}`}>
                      {getElementIcon(data.stem.element)}
                      <span>{data.stem.element} ({data.stem.polarity})</span>
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    [{data.ten_god.chinese} - {data.ten_god.name_thai}]
                  </div>
                </div>

                {/* Earthly Branch */}
                <div className="pt-3">
                  <span className="text-4xl font-black text-slate-900 dark:text-slate-100 block font-serif">
                    {data.branch.chinese}
                  </span>
                  <div className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {data.branch.pinyin} ({data.branch.thai})
                  </div>
                  <div className="mt-1.5 flex items-center justify-center gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1 ${getElementColorClass(data.branch.element)}`}>
                      {getElementIcon(data.branch.element)}
                      <span>{data.branch.animal} ({data.branch.element})</span>
                    </span>
                  </div>

                  {/* Hidden Stems */}
                  <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">
                    ธาตุแฝง: {data.branch.hidden.join(', ')}
                  </div>
                </div>

                {/* Representation note */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {data.representation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Master Analysis & 5 Elements Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Day Master Card */}
        <div className="lg:col-span-6 rounded-2xl bg-gradient-to-br from-amber-50/60 to-white dark:from-slate-900 dark:to-slate-950 border border-amber-200/80 dark:border-amber-900/40 p-5 space-y-3">
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>วิเคราะห์ดิถีตัวตน (Day Master Analysis)</span>
          </h4>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-serif font-black text-2xl flex items-center justify-center shadow-md shadow-amber-500/20">
              {day_master.stem.chinese}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                ดิถี{day_master.stem.thai} ({day_master.stem.element} {day_master.stem.polarity})
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                สภาพพลังงานดิถี: <b className="text-amber-600 dark:text-amber-400">{day_master.strength}</b> (คะแนนส่งเสริม: {day_master.support_score}%)
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-100 dark:border-amber-900/30 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-amber-800 dark:text-amber-300">ธาตุส่งเสริม/ปรับสมดุล (Favorable Elements): </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{day_master.favorable_elements.join(', ')}</span>
          </div>
        </div>

        {/* 5 Elements Percent Distribution */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            สัดส่วนสมดุลห้าธาตุ (Five Elements Ratio)
          </h4>

          <div className="space-y-2.5">
            {[
              { name: 'ไม้ (Wood)', key: 'Wood', pct: five_elements_percent.Wood, color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
              { name: 'ไฟ (Fire)', key: 'Fire', pct: five_elements_percent.Fire, color: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400' },
              { name: 'ดิน (Earth)', key: 'Earth', pct: five_elements_percent.Earth, color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
              { name: 'ทอง (Metal)', key: 'Metal', pct: five_elements_percent.Metal, color: 'bg-slate-400', text: 'text-slate-700 dark:text-slate-300' },
              { name: 'น้ำ (Water)', key: 'Water', pct: five_elements_percent.Water, color: 'bg-sky-500', text: 'text-sky-700 dark:text-sky-400' },
            ].map((elem) => (
              <div key={elem.key} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-semibold ${elem.text}`}>{elem.name}</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">{elem.pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${elem.color} rounded-full transition-all duration-500`} style={{ width: `${elem.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Da Yun (10-Year Luck Pillars) */}
      <div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
          วัฏจักรวัยจร 10 ปี (Da Yun - 大運 10-Year Luck Pillars)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {da_yun.map((dy) => {
            const isActive = currentAge !== undefined && currentAge >= dy.start_age && currentAge <= dy.end_age;
            return (
              <div
                key={dy.step}
                className={`rounded-xl p-3 text-center text-xs transition-all relative ${
                  isActive
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-500 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 whitespace-nowrap shadow-xs">
                    วัยปัจจุบัน
                  </span>
                )}
                <span className={`text-[10px] block mb-1 ${isActive ? 'font-bold text-amber-800 dark:text-amber-300' : 'text-slate-400'}`}>
                  อายุ {dy.start_age}-{dy.end_age}
                </span>
                <div className="text-lg font-black font-serif text-slate-900 dark:text-slate-100">
                  {dy.stem.chinese}{dy.branch.chinese}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {dy.stem.pinyin} {dy.branch.animal}
                </div>
                <div className="mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {dy.ten_god.chinese}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep Macro-to-Micro Bazi Interpretation Section */}
      {bazi.interpretation && (
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>การวิเคราะห์เชิงลึกจากภาพใหญ่สู่ภาพเล็ก (Macro to Micro)</span>
              </div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                ถอดรหัสชะตาชีวิตและยุทธศาสตร์ปาจื่อฉบับสมบูรณ์
              </h4>
            </div>

            {/* Tab navigation pills */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              {[
                { id: 'essence', label: 'แก่นแท้ดิถี', icon: Sparkles },
                { id: 'pillars', label: '4 เสาชะตา', icon: Compass },
                { id: 'career', label: 'การงาน & การเงิน', icon: Shield },
                { id: 'fengshui', label: 'ฮวงจุ้ย & สมดุล', icon: Mountain },
                { id: 'dayun', label: 'วัยจรปัจจุบัน', icon: Flame },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab 1: Day Master Essence */}
          {activeTab === 'essence' && (
            <div className="rounded-2xl p-6 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/30 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h5 className="text-base font-black text-slate-900 dark:text-amber-300">
                  {bazi.interpretation.macro_summary.day_master_title}
                </h5>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 self-start sm:self-auto">
                  {bazi.interpretation.macro_summary.strength_status} (คะแนน: {bazi.interpretation.macro_summary.strength_score}%)
                </span>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {bazi.interpretation.macro_summary.core_essence}
              </p>

              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {bazi.interpretation.macro_summary.strength_explanation}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-bold">🌟 ธาตุปรับสมดุลและให้คุณสูงสุด: </span>
                {bazi.interpretation.macro_summary.favorable_elements_thai.join(", ")}
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  จุดเด่นและความสามารถตามธรรมชาติ (Innate Talents):
                </div>
                <div className="flex flex-wrap gap-2">
                  {bazi.interpretation.macro_summary.talents.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs"
                    >
                      ★ {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                    ⚠️ จุดบอดที่ต้องระวัง (Shadow Pattern):
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {bazi.interpretation.macro_summary.shadow}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    💡 แนวทางปรับพฤติกรรมเพื่อความสำเร็จ:
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {bazi.interpretation.macro_summary.action_advice}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Four Pillars Meaning */}
          {activeTab === 'pillars' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              {[
                { key: 'year', data: bazi.interpretation.four_pillars_meaning.year_pillar },
                { key: 'month', data: bazi.interpretation.four_pillars_meaning.month_pillar },
                { key: 'day', data: bazi.interpretation.four_pillars_meaning.day_pillar },
                { key: 'hour', data: bazi.interpretation.four_pillars_meaning.hour_pillar },
              ].map((p) => (
                <div
                  key={p.key}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-amber-700 dark:text-amber-400">
                      {p.data.pillars_str}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                      {p.data.stage}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {p.data.title}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {p.data.meaning}
                  </p>
                </div>
              ))}
            </div>
          )}


          {/* Tab 3: Career & Wealth */}
          {activeTab === 'career' && (
            <div className="rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
              <div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                  ยุทธศาสตร์การสร้างความมั่งคั่ง (Wealth Building Strategy):
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {bazi.interpretation.career_wealth.wealth_strategy}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  บทบาทการทำงานที่ดึงศักยภาพสูงสุด (Optimal Operational Role):
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {bazi.interpretation.career_wealth.operational_role}
                </p>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  กลุ่มอุตสาหกรรมและธุรกิจที่ส่งเสริมดวงชะตา (Favorable Industries):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bazi.interpretation.career_wealth.favorable_industries.map((ind, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                    >
                      {ind}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Feng Shui & Lifestyle */}
          {activeTab === 'fengshui' && (
            <div className="rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    🎨 โทนสีมงคลเสริมธาตุปรับสมดุล (Lucky Colors):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {bazi.interpretation.feng_shui.lucky_colors.map((c, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    🧭 ทิศทางที่ส่งเสริมพลังงาน (Auspicious Directions):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {bazi.interpretation.feng_shui.auspicious_directions.map((d, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold text-amber-800 dark:text-amber-300">ฮวงจุ้ยโต๊ะทำงาน: </span>
                {bazi.interpretation.feng_shui.desk_placement_tip}
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  กิจวัตรและวิถีชีวิตเพื่อลดเอนโทรปี (Lifestyle Habits for Energy Equilibrium):
                </div>
                <ul className="space-y-1.5">
                  {bazi.interpretation.feng_shui.lifestyle_habits.map((h, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2"
                    >
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 5: Da Yun Guidance */}
          {activeTab === 'dayun' && (
            <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-50/40 to-white dark:from-slate-900 dark:to-slate-950 border border-amber-200/80 dark:border-amber-900/40 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                    {bazi.interpretation.da_yun_guidance.current_cycle}
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {bazi.interpretation.da_yun_guidance.pillars_str} — {bazi.interpretation.da_yun_guidance.ten_god}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                  {bazi.interpretation.da_yun_guidance.element_theme}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  คำแนะนำเชิงยุทธศาสตร์ในช่วง 10 ปีนี้ (10-Year Strategic Guidance):
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {bazi.interpretation.da_yun_guidance.tactical_advice}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

