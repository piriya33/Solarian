import React, { useState } from 'react';
import type { TimelineData, MajorPeriod, YearEntry } from '../types';
import { Sparkles, Milestone, Activity, Compass, CheckCircle2, Calendar, ShieldAlert, Target, ShieldCheck } from 'lucide-react';

interface LifeMap108Props {
  timeline: TimelineData;
  birthYear: number;
}

export const LifeMap108: React.FC<LifeMap108Props> = ({ timeline, birthYear }) => {
  const [selectedAge, setSelectedAge] = useState<number>(40); // default to age 40 / mature inspection

  const currentYearEntry: YearEntry =
    timeline.years_map.find((y) => y.age === selectedAge) || timeline.years_map[0];

  const currentMajor = timeline.major_periods.find(
    (mp) => mp.start_age <= selectedAge && selectedAge < mp.end_age
  ) || timeline.major_periods[0];

  const quickAges = [0, 12, 18, 24, 29, 36, 40, 50, 58, 72, 84];

  return (
    <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>แผนที่วงจรชีวิต 108 ปี (Maha Thaksa & Entropy Timeline)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ดาวเสวยอายุ (ภาพใหญ่ Macro) กำหนดสภาวะแวดล้อมหลัก โดยมีดาวแทรกและดาวจร (Micro) เป็นตัวกระตุ้น
              </p>
            </div>
          </div>
        </div>

        {/* Selected Age Badge */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-xs shadow-sm">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span className="text-slate-600 dark:text-slate-400">กำลังตรวจดูวัย:</span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
            {selectedAge} ปี (ปี ค.ศ. {birthYear + selectedAge})
          </span>
        </div>
      </div>

      {/* 1. Proportional Lifecycle Bar with Defensive Sizing */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span>วงรอบกำลังดาว 8 ช่วงวัย (108 ปีบริบูรณ์)</span>
          <span className="text-amber-600 dark:text-amber-400 font-medium">คลิกเลือกช่วงวัยเพื่อสำรวจ</span>
        </div>

        {/* Proportional Bar */}
        <div className="w-full h-11 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex border border-slate-200 dark:border-slate-800 p-1 gap-1 shadow-inner">
          {timeline.major_periods.map((mp: MajorPeriod) => {
            const widthPct = (mp.duration_years / 108.0) * 100;
            const isCurrent = mp.start_age <= selectedAge && selectedAge < mp.end_age;

            return (
              <button
                key={mp.period_index}
                type="button"
                onClick={() => setSelectedAge(Math.floor(mp.start_age))}
                style={{ width: `${widthPct}%` }}
                className={`h-full rounded-lg transition-all flex flex-col items-center justify-center relative cursor-pointer min-w-0 overflow-hidden ${
                  isCurrent
                    ? 'ring-2 ring-amber-500 z-10 shadow-md scale-[1.02]'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title={`ดาว${mp.planet_thai} เสวยอายุ ${mp.duration_years} ปี (อายุ ${mp.start_age}-${mp.end_age})`}
              >
                {/* Background color */}
                <div
                  className="absolute inset-0 rounded-lg opacity-25 dark:opacity-30"
                  style={{ backgroundColor: mp.planet_color }}
                />

                {/* Planet Glyph */}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 relative z-10 truncate px-0.5">
                  {mp.planet_symbol}
                </span>

                {/* Duration text (Hidden on ultra-narrow slots to prevent overflow) */}
                <span className="text-[9px] text-slate-500 dark:text-slate-400 relative z-10 hidden sm:inline leading-none mt-0.5">
                  {mp.duration_years}ป
                </span>
              </button>
            );
          })}
        </div>

        {/* Age ticks */}
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1 font-mono">
          <span>0 ปี</span>
          <span>20 ปี</span>
          <span>40 ปี</span>
          <span>60 ปี</span>
          <span>80 ปี</span>
          <span>108 ปี</span>
        </div>
      </div>

      {/* 2. Responsive Period Pills / Mobile Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 text-xs no-scrollbar">
        {timeline.major_periods.map((mp: MajorPeriod) => {
          const isCurrent = mp.start_age <= selectedAge && selectedAge < mp.end_age;
          return (
            <button
              key={`pill-${mp.period_index}`}
              type="button"
              onClick={() => setSelectedAge(Math.floor(mp.start_age))}
              className={`shrink-0 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{mp.planet_symbol}</span>
              <span>ดาว{mp.planet_thai}</span>
              <span className="text-[10px] opacity-75">({mp.start_age}-{mp.end_age}ปี)</span>
            </button>
          );
        })}
      </div>

      {/* 3. Age Scrubber Slider & Quick Jumps */}
      <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 mb-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2.5">
          <input
            type="range"
            min="0"
            max="108"
            value={selectedAge}
            onChange={(e) => setSelectedAge(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Quick age jump buttons */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">จุดเปลี่ยนสำคัญ:</span>
          {quickAges.map((age) => (
            <button
              key={age}
              type="button"
              onClick={() => setSelectedAge(age)}
              className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedAge === age
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              อายุ {age}
            </button>
          ))}
        </div>

        {/* 30-Degree Harmonic Trigger Quick Jump Bar */}
        {timeline.degree_triggers_catalog && timeline.degree_triggers_catalog.length > 0 && (
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>หมุดหมายปีที่ดาวเข้ามากระทบ (วิถีองศาฐาน 30° จากดวงอาทิตย์):</span>
              </span>
              <span className="text-[10px] text-slate-400">คลิกเพื่อสำรวจปีที่เกิดแรงปะทะ</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {timeline.degree_triggers_catalog.map((pt) => {
                // Find next upcoming or primary hit for this planet near current age or in cycle 1/2
                const hitAges = pt.impact_ages.map((a) => a.rounded_age);
                const isSelected = hitAges.includes(selectedAge);
                const firstAge = hitAges[0] || 0;
                return (
                  <button
                    key={`trigger-btn-${pt.planet_name}`}
                    type="button"
                    onClick={() => {
                      // Jump to the closest impact age to selectedAge or first age
                      const closest = hitAges.reduce((prev, curr) =>
                        Math.abs(curr - selectedAge) < Math.abs(prev - selectedAge) ? curr : prev
                      , firstAge);
                      setSelectedAge(closest);
                    }}
                    className={`shrink-0 px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-md scale-105'
                        : 'bg-white dark:bg-slate-900 border-rose-300/60 dark:border-rose-900/50 text-slate-700 dark:text-slate-300 hover:border-rose-500'
                    }`}
                    title={`ดาว${pt.planet_thai} กระทบที่อายุ: ${hitAges.join(', ')} ปี (ระยะ ${pt.distance_deg}°)`}
                  >
                    <span className="font-bold text-sm" style={{ color: isSelected ? '#ffffff' : pt.planet_color }}>
                      {pt.planet_symbol}
                    </span>
                    <span className="font-medium">ดาว{pt.planet_thai}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      ({hitAges.slice(0, 3).join(', ')}ป)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Detail Inspection Card for the Selected Age */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Planetary Periods Status */}
        <div className="space-y-3.5">
          {/* Major Ruler (ภาพใหญ่ Macro) */}
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  1. ดาวเสวยอายุ (ภาพใหญ่ Macro)
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  {currentMajor.duration_years} ปี
                </span>
              </div>

              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm shrink-0"
                  style={{ backgroundColor: currentMajor.planet_color }}
                >
                  {currentMajor.planet_symbol}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    ดาว{currentMajor.planet_thai} ({currentMajor.planet_name})
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ช่วงวัย {currentMajor.start_age} ถึง {currentMajor.end_age} ปี (อายุย่าง {Math.floor(currentMajor.start_age) + 1} - {Math.floor(currentMajor.end_age)} ปี)
                  </p>
                </div>
              </div>

              {/* Badges bar */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {currentYearEntry.reading?.macro_detail?.house_sign_label && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700">
                    {currentYearEntry.reading.macro_detail.house_sign_label}
                  </span>
                )}
                {currentYearEntry.reading?.macro_detail?.dignity_label && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {currentYearEntry.reading.macro_detail.dignity_label}
                  </span>
                )}
              </div>

              {/* Epoch Theme */}
              <div className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                <div>
                  <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5 text-[11px]">
                    ธีมหลักแห่งยุค (Macro Epoch):
                  </span>
                  <p className="text-[11.5px] leading-relaxed">
                    {currentYearEntry.reading?.macro_detail?.epoch_theme || currentYearEntry.reading?.macro_narrative}
                  </p>
                </div>

                {currentYearEntry.reading?.macro_detail?.strategic_focus && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5 text-[11px]">
                      ทิศทางยุทธศาสตร์และการสร้างคุณค่า:
                    </span>
                    <p className="text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {currentYearEntry.reading.macro_detail.strategic_focus}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Entropy Risk Alert */}
            {currentYearEntry.reading?.macro_detail?.entropy_risk && (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-200">
                <span className="font-bold block mb-0.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  การควบคุม Entropy & ลดความสูญเสีย:
                </span>
                <p className="text-[10.5px] leading-relaxed opacity-90">
                  {currentYearEntry.reading.macro_detail.entropy_risk}
                </p>
              </div>
            )}
          </div>

          {/* Card 2: 30-Degree Harmonic Trigger / Sub-period Dynamics */}
          {currentYearEntry.reading?.degree_trigger_detail ? (
            /* ACTIVE 30-DEGREE DEGREE TRIGGER CARD */
            <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-purple-500/10 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-purple-950/30 border-2 border-amber-500/50 dark:border-amber-400/40 rounded-xl p-4 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    2. ดาวเข้ามากระทบ (วิถีองศาฐาน 30°)
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                    รอบที่ {currentYearEntry.reading.degree_trigger_detail.cycle_num}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-md shrink-0 ring-2 ring-rose-500/30"
                    style={{ backgroundColor: currentYearEntry.reading.degree_trigger_detail.planet_color }}
                  >
                    {currentYearEntry.reading.degree_trigger_detail.planet_symbol}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                      <span>ดาว{currentYearEntry.reading.degree_trigger_detail.planet_thai}</span>
                      <span className="text-[11px] font-normal text-slate-500">({currentYearEntry.reading.degree_trigger_detail.planet_name})</span>
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                      {currentYearEntry.reading.degree_trigger_detail.timing_str}
                    </p>
                  </div>
                </div>

                {/* Badges bar */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/40">
                    {currentYearEntry.reading.degree_trigger_detail.pair_type}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700">
                    {currentYearEntry.reading.degree_trigger_detail.house_name} ({currentYearEntry.reading.degree_trigger_detail.house_area})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    ระยะห่าง {currentYearEntry.reading.degree_trigger_detail.distance_deg}°
                  </span>
                </div>

                {/* Narrative */}
                <div className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1 text-[11px]">
                      การปะทะของดาวจุดชนวน (Degree Modulo-30 Impact):
                    </span>
                    <p className="text-[11.5px] leading-relaxed">
                      {currentYearEntry.reading.degree_trigger_detail.trigger_narrative}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5 text-[11px]">
                      ปฏิสัมพันธ์กับดาวเสวยอายุใหญ่:
                    </span>
                    <p className="text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {currentYearEntry.reading.degree_trigger_detail.pair_desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notice pill */}
              <div className="mt-3 p-2 rounded-lg bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 text-[10.5px] text-rose-900 dark:text-rose-200">
                <span className="font-semibold">★ ข้อสังเกตเชิงลึก:</span> พลังของดาว{currentYearEntry.reading.degree_trigger_detail.planet_thai} กำลังเข้ามากระตุ้นจุดเปลี่ยนแปลงใน {currentYearEntry.reading.degree_trigger_detail.house_area} โดยมีดาว{currentMajor.planet_thai} เป็นสภาพแวดล้อมใหญ่
              </div>
            </div>
          ) : (
            /* REGULAR SUB-PERIOD CARD (WHEN NO DEGREE TRIGGER IN THIS YEAR) */
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                    2. ดาวแทรกอายุ (ตัวเร่ง Catalyst)
                  </span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                    {currentYearEntry.sub_duration_str}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm shrink-0"
                    style={{ backgroundColor: currentYearEntry.sub_planet.color }}
                  >
                    {currentYearEntry.sub_planet.symbol}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      ดาว{currentYearEntry.sub_planet.thai} ({currentYearEntry.sub_planet.name})
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      ขับเคลื่อนระยะสั้น {currentYearEntry.sub_duration_str}
                    </p>
                  </div>
                </div>

                {/* Badges bar */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {currentYearEntry.reading?.sub_detail?.pair_type && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                      {currentYearEntry.reading.sub_detail.pair_type}
                    </span>
                  )}
                  {currentYearEntry.reading?.sub_detail?.pair_desc && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700">
                      {currentYearEntry.reading.sub_detail.pair_desc}
                    </span>
                  )}
                </div>

                {/* Catalyst & Opportunity */}
                <div className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="font-bold text-sky-600 dark:text-sky-400 block mb-0.5 text-[11px]">
                      บทบาทตัวเร่ง (Catalyst Dynamics):
                    </span>
                    <p className="text-[11.5px] leading-relaxed">
                      {currentYearEntry.reading?.sub_detail?.catalyst_role || currentYearEntry.reading?.sub_narrative}
                    </p>
                  </div>

                  {currentYearEntry.reading?.sub_detail?.window_opportunity && (
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                      <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5 text-[11px]">
                        หน้าต่างแห่งโอกาส (Opportunity Window):
                      </span>
                      <p className="text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {currentYearEntry.reading.sub_detail.window_opportunity}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tactical Caution Alert */}
              {currentYearEntry.reading?.sub_detail?.immediate_caution && (
                <div className="mt-3 p-2.5 rounded-lg bg-sky-500/10 dark:bg-sky-950/20 border border-sky-500/30 text-[11px] text-sky-900 dark:text-sky-200">
                  <span className="font-bold block mb-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    ข้อควรระวังเฉพาะหน้า (Tactical Caution):
                  </span>
                  <p className="text-[10.5px] leading-relaxed opacity-90">
                    {currentYearEntry.reading.sub_detail.immediate_caution}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Middle & Right Column: Synthesized Life Strategy & Transits */}
        <div className="lg:col-span-2 space-y-3.5">
          {/* Main Strategic Reading */}
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ยุทธศาสตร์การวางแผนชีวิตวัย {selectedAge} ปี (Actionable Strategy)
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                พ.ศ. {birthYear + selectedAge + 543} (ค.ศ. {birthYear + selectedAge}) • อายุย่าง {selectedAge + 1} ปี
              </span>
            </div>

            {/* Thaksa Banner & Strategic Guidance */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/30 text-xs mb-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-bold text-amber-800 dark:text-amber-300 text-xs">
                  {currentYearEntry.reading?.annual_thaksa_highlight}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-xs">
                {currentYearEntry.reading?.overall_advice}
              </p>
            </div>

            {/* Decision Framework & Action Plan */}
            {currentYearEntry.reading?.action_plan && (
              <div className="space-y-3 mb-3.5">
                {/* Decision Framework Card */}
                <div className="p-3 rounded-lg bg-indigo-500/10 dark:bg-indigo-950/25 border border-indigo-500/25 text-xs">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-1 flex items-center gap-1.5 text-[11px]">
                    <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    หลักยึดในการตัดสินใจ (Decision Framework):
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11.5px]">
                    {currentYearEntry.reading.action_plan.decision_framework}
                  </p>
                </div>

                {/* Strategic Moves (3 concrete moves) */}
                {currentYearEntry.reading.action_plan.strategic_moves && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      กลยุทธ์เชิงรุก 3 ประการ (High-Leverage Initiatives):
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {currentYearEntry.reading.action_plan.strategic_moves.map((move: string, idx: number) => (
                        <div
                          key={`move-${idx}`}
                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-lg text-[11.5px] text-slate-700 dark:text-slate-300 flex items-start gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{move}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Mitigation */}
                {currentYearEntry.reading.action_plan.risk_mitigation && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      การบริหารความเสี่ยง & ลดความสูญเสีย (Entropy Mitigation):
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {currentYearEntry.reading.action_plan.risk_mitigation.map((risk: string, idx: number) => (
                        <div
                          key={`risk-${idx}`}
                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-lg text-[11.5px] text-slate-700 dark:text-slate-300 flex items-start gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            •
                          </span>
                          <span className="leading-snug">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Milestones & Significant Transits */}
            {currentYearEntry.reading?.milestones && currentYearEntry.reading.milestones.length > 0 && (
              <div className="space-y-2 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Milestone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>หมุดหมายชีวิตสำคัญ (Major Astronomical Milestones):</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentYearEntry.reading.milestones.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white dark:bg-slate-900 border border-rose-500/30 rounded-lg text-xs"
                    >
                      <span className="font-bold text-rose-600 dark:text-rose-400 block">{m.title}</span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">{m.description || m.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Micro Transits Active Hits */}
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-500 shrink-0" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  ดาวจรตกกระทบพื้นดวงในรอบปี (Annual Transits)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentYearEntry.reading?.transit_highlights?.length || 0} มุมสัมพันธ์
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {currentYearEntry.reading?.transit_highlights && currentYearEntry.reading.transit_highlights.length > 0 ? (
                currentYearEntry.reading.transit_highlights.map((th: string, idx: number) => (
                  <div
                    key={idx}
                    className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{th}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic py-2">
                  ไม่มีดาวเคราะห์วงนอกตกกระทบทำมุมรุนแรงในรอบปีนี้ สภาวะชีวิตดำเนินไปอย่างมีเสถียรภาพ
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
