import React, { useState } from "react";
import type { ApiResponse } from "../types";
import { ZodiacIcon } from "./ZodiacIcon";
import { NatalWheel } from "./NatalWheel";
import { AstrologyReferenceModal } from "./AstrologyReferenceModal";
import {
  Sun,
  Moon,
  Compass,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  Briefcase,
  Coins,
  Heart,
  FileText,
  Sliders,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Target,
  BookOpen,
  Users,
  Crown,
  Flame,
  ShieldCheck,
} from "lucide-react";

interface SimpleReadingViewProps {
  data: ApiResponse;
  onSwitchToPro: () => void;
  onSwitchToBazi?: () => void;
  onSwitchToAi?: () => void;
  onExportPdf: () => void;
  isExporting?: boolean;
  selectedPlanet?: string | null;
  onSelectPlanet?: (name: string | null) => void;
}

export const SimpleReadingView: React.FC<SimpleReadingViewProps> = ({
  data,
  onSwitchToPro,
  onSwitchToBazi,
  onSwitchToAi,
  onExportPdf,
  isExporting = false,
  selectedPlanet = null,
  onSelectPlanet = () => {},
}) => {
  const { chart, trinity, timeline } = data;
  const birthDate = chart.metadata.birth_date;
  const personName = chart.metadata.name || (chart as any).name || "คุณ";

  // Calculate current age
  const birthYear = parseInt(birthDate.split("-")[0]);
  const currentCalYear = new Date().getFullYear();
  const currentAge = Math.max(0, Math.min(107, currentCalYear - birthYear));

  // Find current year data from years_map
  const currentYearData =
    timeline?.years_map?.find((y) => y.age === currentAge) ||
    timeline?.years_map?.[0];

  const reading = currentYearData?.reading;
  const macroDetail = reading?.macro_detail;
  const subDetail = reading?.sub_detail;
  const actionPlan = reading?.action_plan;

  // Derive strategic moves & risk mitigations
  const focusPoints = actionPlan?.strategic_moves?.length
    ? actionPlan.strategic_moves
    : [
        "จัดระเบียบโครงสร้างการเงินและการลงทุนระยะยาว",
        "เสริมสร้างความสัมพันธ์กับพันธมิตรที่มีวิสัยทัศน์ตรงกัน",
        "สื่อสารความเชี่ยวชาญเฉพาะทางให้เป็นที่ประจักษ์",
      ];

  const cautionPoints = actionPlan?.risk_mitigation?.length
    ? actionPlan.risk_mitigation
    : [
        "หลีกเลี่ยงการรับภาระงานเกินขีดความสามารถที่จะจัดการได้จริง",
        "ระมัดระวังความขัดแย้งที่เกิดจากการสื่อสารคลาดเคลื่อน",
      ];

  const decisionFramework =
    actionPlan?.decision_framework ||
    "มุ่งเน้นการตัดสินใจบนรากฐานของข้อเท็จจริงและความยั่งยืน มากกว่าผลประโยชน์ฉาบฉวยระยะสั้น";

  // The Big Three from Trinity
  const sunInfo = trinity.personality_trinity.sun;
  const moonInfo = trinity.personality_trinity.moon;
  const ascInfo = trinity.personality_trinity.ascendant;

  const [isRefModalOpen, setIsRefModalOpen] = useState(false);

  const dayResult = data.day_result;
  const majorPeriods = timeline?.major_periods || [];
  const currentMajor =
    majorPeriods.find((mp) => mp.start_age <= currentAge && currentAge < mp.end_age) ||
    majorPeriods[0];

  const annualRole = data.thaksa_matrix?.find(
    (r) => r.planet_num === currentYearData?.annual_thaksa?.num
  );

  const majorPlanetKey =
    currentYearData?.major_planet?.name === "Rahu"
      ? "True Node"
      : (currentYearData?.major_planet?.name || "Sun");
  const majorNatalPlanet =
    chart.planets_dict[majorPlanetKey] ||
    (currentYearData?.major_planet?.name
      ? chart.planets_dict[currentYearData.major_planet.name]
      : null) ||
    chart.planets_dict["Sun"];

  const sunriseDisplay =
    dayResult?.sunrise_time ||
    (chart.metadata.sunrise_local ? chart.metadata.sunrise_local.slice(0, 5) : "--:--");
  const sunsetDisplay =
    dayResult?.sunset_time ||
    (chart.metadata.sunset_local ? chart.metadata.sunset_local.slice(0, 5) : "--:--");

  const synergyDynamic =
    subDetail?.synergy_dynamic ||
    "การผสานพลังงานดำเนินไปตามปกติ ความสำเร็จขึ้นอยู่กับวินัยและการลงมือทำอย่างสม่ำเสมอ";
  const pairTitle =
    subDetail?.catalyst_title ||
    (synergyDynamic.includes(":") ? synergyDynamic.split(":")[0] : "จังหวะดำเนินงานตามปกติ");

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Hero Life Compass Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-amber-50/40 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-amber-200/60 dark:border-amber-500/20 p-6 sm:p-10 shadow-xl shadow-amber-500/5">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gradient-to-br from-amber-400/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>เข็มทิศและแก่นแท้ชีวิต (Core Life Blueprint)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            การเดินทางแห่งชีวิตของ{" "}
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-300 dark:via-amber-400 dark:to-amber-200 bg-clip-text text-transparent">
              {personName}
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            ผูกดวงด้วยระบบพลาซิดัสมาตรฐานดาราศาสตร์สากล DE431
            สะท้อนศักยภาพที่ซ่อนอยู่ พิมพ์เขียวพลังงานจิตวิญญาณ
            และช่วงเวลาจังหวะชีวิตที่ทรงอิทธิพลสูงสุด
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {/* Prominent Astrological Birth Day Badge */}
            <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-900 dark:text-amber-300 dark:bg-amber-950/70 px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700/60 font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                วันเกิดทางโหราศาสตร์: {dayResult?.day_name || "วันอาทิตย์"}
                {dayResult?.is_rahu_night ? " (พระราหู ๘)" : ` (พระ${dayResult?.planet_thai || "อาทิตย์"})`}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>สูติบัตร {chart.metadata.birth_date}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>เวลา {chart.metadata.birth_time} น.</span>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>ลัคนา{chart.angles.Ascendant.sign_thai} ({chart.angles.Ascendant.formatted_dms})</span>
            </span>

            <button
              onClick={() => setIsRefModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-amber-600 dark:hover:bg-amber-400 dark:hover:text-slate-950 font-bold transition-all shadow-sm ml-auto"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📚 ตารางคู่ดาว & ดาวประจำราศี (Ref)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. 5-Point Astrological Identity Card (อัตลักษณ์โหราศาสตร์ 5 มิติ) */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>บทวิเคราะห์พื้นดวงและจังหวะชีวิต 5 มิติ (5-Point Core Astrological Identity)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              โครงสร้างดวงชะตาและพลังงานขับเคลื่อนชีวิต
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              ถอดรหัสวันเกิดตามการตัดวันจริง ลัคนา สุริยราศี ดาวเสวยอายุ ดาวแทรก และคู่ดาวมิตร-ศัตรู
            </p>
          </div>

          <button
            onClick={() => setIsRefModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 font-bold text-xs sm:text-sm transition-all shrink-0"
          >
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>ดูตารางคู่มิตร-ศัตรู & ราศี</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Point 1: วันเกิดทางโหราศาสตร์ */}
          <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>มิติที่ ๑: วันเกิดตามคัมภีร์</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                {dayResult?.is_rahu_night ? "พุธกลางคืน (ราหู)" : dayResult?.day_name || "วันอาทิตย์"}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
              {dayResult?.day_name || "วันอาทิตย์"}
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {dayResult?.reason || "นับวันใหม่เมื่อพระอาทิตย์ขึ้นตามหลักโหราศาสตร์ไทย"}
            </p>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p>☀️ พระอาทิตย์ขึ้น: <strong>{sunriseDisplay} น.</strong></p>
              <p>🌙 พระอาทิตย์ตก: <strong>{sunsetDisplay} น.</strong></p>
              <p>👑 ดาวครองวัน: <strong>พระ{dayResult?.planet_thai}</strong> (กำลัง {dayResult?.period_years} ปี / ภูมิบริวารเดิม)</p>
            </div>
          </div>

          {/* Point 2: ลัคนาและราศีเกิด */}
          <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-500" />
                <span>มิติที่ ๒: ลัคนา & ราศีแกนหลัก</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700/50">
                3 ขุมพลัง
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-500 dark:text-slate-400">ลัคนา (Ascendant):</span>
                <span className="font-bold text-sky-700 dark:text-sky-300">
                  ราศี{chart.angles.Ascendant.sign_thai} ({chart.angles.Ascendant.formatted_dms})
                </span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-500 dark:text-slate-400">สุริยราศี (Sun):</span>
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  ราศี{chart.planets_dict.Sun.sign_thai} (ภพ {chart.planets_dict.Sun.house})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400">จันทรราศี (Moon):</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300">
                  ราศี{chart.planets_dict.Moon.sign_thai} (ภพ {chart.planets_dict.Moon.house})
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
              ลัคนาเป็นประตูดวงชะตาและบุคลิกภายนอก ส่วนสุริยราศีคือเจตจำนงแท้จริง
            </p>
          </div>

          {/* Point 3: ดาวเสวยอายุปัจจุบัน */}
          <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-purple-500" />
                <span>มิติที่ ๓: ดาวเสวยอายุปัจจุบัน</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/50">
                วัย {currentAge} ปี
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>ดาว{currentYearData?.major_planet.thai}</span>
              <span className="text-sm font-mono text-purple-600 dark:text-purple-400">
                ({currentYearData?.major_planet.symbol})
              </span>
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              เสวยอายุหลัก {currentYearData?.major_duration_years} ปี (ช่วงอายุ {currentMajor?.start_age} ถึง {currentMajor?.end_age} ปี)
            </p>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p>
                🏛️ ธีมยุค: <strong>{macroDetail?.epoch_theme || reading?.macro_narrative || "ยุคแห่งการสร้างรากฐาน"}</strong>
              </p>
              <p>
                📍 ดวงเดิม: สถิตภพที่ {majorNatalPlanet?.house || 1} ({majorNatalPlanet?.sign_thai || ''})
              </p>
            </div>
          </div>

          {/* Point 4: มีอะไรทักษาจรมาเจอ (ดาวแทรก & ทักษาจร) */}
          <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>มิติที่ ๔: ดาวแทรก & ทักษาจร</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50">
                อายุย่าง {currentYearData?.age_yang} ปี
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">ดาวแทรกอายุ (ตัวเร่ง/จุดเปลี่ยน):</p>
              <h4 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <span>ดาว{currentYearData?.sub_planet.thai}</span>
                <span className="text-sm font-mono text-rose-600 dark:text-rose-400">({currentYearData?.sub_planet.symbol})</span>
              </h4>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p>
                🎯 <strong>ทักษาจรประจำปี:</strong> ดาว{currentYearData?.annual_thaksa.thai} ({currentYearData?.annual_thaksa.symbol})
              </p>
              <p>
                🧭 <strong>ตกภูมิ:</strong> <span className="font-bold text-amber-700 dark:text-amber-400">ภูมิ{annualRole?.role_thai || "จร"}</span> ({annualRole?.role_desc || "ส่งอิทธิพลต่อผลงานและความเคลื่อนไหวในรอบปี"})
              </p>
            </div>
          </div>

          {/* Point 5: เป็นคู่มิตร ศัตรูกันอย่างไร (Planetary Dynamics) - spans 2 cols on lg */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 dark:from-slate-800/90 dark:to-slate-900 border border-amber-200/80 dark:border-amber-500/30 md:col-span-2 lg:col-span-2 space-y-3 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>มิติที่ ๕: พลวัตคู่ดาว (คู่มิตร / ศัตรู / สมพล / ธาตุ)</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50">
                {pairTitle}
              </span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                ความสัมพันธ์ระหว่าง ดาวเสวยอายุ ({currentYearData?.major_planet.thai}) กับ ดาวแทรก ({currentYearData?.sub_planet.thai})
              </h4>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {synergyDynamic}
              </p>
            </div>

            {subDetail?.window_opportunity && (
              <div className="pt-2.5 border-t border-amber-200/70 dark:border-slate-700 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>จังหวะทองและคานงัด:</strong> {subDetail.window_opportunity}</span>
              </div>
            )}

            {subDetail?.immediate_caution && (
              <div className="text-xs text-rose-800 dark:text-rose-300 font-medium flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span><strong>ข้อควรระมัดระวัง:</strong> {subDetail.immediate_caution}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Placidus Natal Chart Wheel & The Core Trinity */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 text-xs font-bold mb-1">
              <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>แผนที่ดวงกำเนิดและ 3 แก่นแท้แห่งตัวตน (Placidus Natal Chart & The Core Trinity)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              วงล้อดวงกำเนิดพลาซีดัส และ 3 แก่นแท้แห่งตัวตน
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              ผูกดวงตามระบบพลาซีดัสมาตรฐานดาราศาสตร์สากล (DE431) แสดงลัคนา (AC) ทิศตะวันออก (ซ้าย) เมริเดียนฟ้า (MC) ด้านบนสุด พร้อมแก่นแท้ อาทิตย์ จันทร์ และลัคนา
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main: Interactive Placidus Natal Wheel Card */}
          <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm flex flex-col items-center">
            <NatalWheel
              chart={chart}
              selectedPlanet={selectedPlanet}
              onSelectPlanet={onSelectPlanet}
              theme="light"
            />
          </div>

          {/* Right: The 3 Core Trinity Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Sun Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    ดวงอาทิตย์ (Sun)
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">• ตัวตนที่แท้จริง</span>
                </div>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ZodiacIcon sign={chart.planets_dict.Sun.sign_thai} size={20} />
                <span>ราศี{chart.planets_dict.Sun.sign_thai}</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">
                  ({chart.planets_dict.Sun.degrees}°{chart.planets_dict.Sun.minutes}')
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ภพที่ {chart.planets_dict.Sun.house} • {sunInfo.dignity || "มาตรฐานพลังงานเฉพาะตัว"}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1.5">
                <p>
                  <b>แก่นจิตวิญญาณ:</b> {sunInfo.core_nature || "มุ่งมั่นสร้างผลงานที่มีคุณค่า มีพลังแห่งการเป็นผู้นำและการริเริ่มสร้างสรรค์"}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  <b>พื้นที่เฉิดฉาย:</b> {sunInfo.house_theme || "เน้นความสำเร็จและผลงานเชิงประจักษ์"}
                </p>
              </div>
            </div>

            {/* Moon Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    ดวงจันทร์ (Moon)
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">• โลกภายใน & อารมณ์</span>
                </div>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ZodiacIcon sign={chart.planets_dict.Moon.sign_thai} size={20} />
                <span>ราศี{chart.planets_dict.Moon.sign_thai}</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">
                  ({chart.planets_dict.Moon.degrees}°{chart.planets_dict.Moon.minutes}')
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ภพที่ {chart.planets_dict.Moon.house} • {moonInfo.dignity || "สัญชาตญาณความรู้สึก"}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1.5">
                <p>
                  <b>ความปลอดภัยทางใจ:</b> {moonInfo.emotional_instinct || "ต้องการความสงบ ความเข้าใจ และบรรยากาศที่เกื้อหนุนความรู้สึก"}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  <b>ปฏิกิริยาอัตโนมัติ:</b> ละเอียดอ่อนต่อบรรยากาศรอบข้าง ไวต่อการรับรู้ความจริงใจ
                </p>
              </div>
            </div>

            {/* Ascendant Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    ลัคนา (Rising / AC)
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">• บุคลิกภาพด่านหน้า</span>
                </div>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ZodiacIcon sign={chart.angles.Ascendant.sign_thai} size={20} />
                <span>ราศี{chart.angles.Ascendant.sign_thai}</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">
                  ({chart.angles.Ascendant.degrees}°{chart.angles.Ascendant.minutes}')
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                องศา {chart.angles.Ascendant.degrees}° {chart.angles.Ascendant.minutes}&apos; • ประตูดวงชะตา
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1.5">
                <p>
                  <b>ภาพลักษณ์ที่คนสัมผัส:</b> {ascInfo.outward_persona || "มีบุคลิกที่น่าเชื่อถือ มีสายตาที่มุ่งมั่นและท่าทีที่เป็นมิตร"}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  <b>แนวทางชีวิต:</b> ขับเคลื่อนด้วยเป้าหมายและพัฒนาตนเองอย่างต่อเนื่อง
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Current Life Chapter (Age & Timing) */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                บทชีวิตปัจจุบัน (Current Chapter)
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
              วัย {currentAge} ปี (พ.ศ. {currentCalYear + 543} / ค.ศ. {currentCalYear})
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400">ดาวเสวยอายุ:</span>{" "}
              <b className="text-amber-600 dark:text-amber-400">
                {currentYearData?.major_planet.thai || "ดาวหลัก"}
              </b>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400">ดาวแทรกอายุ:</span>{" "}
              <b className="text-sky-600 dark:text-sky-400">
                {currentYearData?.sub_planet.thai || "ดาวเร่ง"}
              </b>
            </div>
          </div>
        </div>

        {/* Narrative & Decision Framework */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>ธีมหลักและโอกาสในบทชีวิตนี้</span>
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {macroDetail?.epoch_theme ||
                  reading?.macro_narrative ||
                  "ช่วงชีวิตนี้เป็นช่วงเวลาสำคัญของการบุกเบิกและลงหลักปักฐาน พลังแห่งดวงดาวส่งเสริมให้คุณนำความรู้ ประสบการณ์ และสายสัมพันธ์มาแปรเปลี่ยนเป็นความสำเร็จที่ยั่งยืน"}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-500" />
                <span>เข็มทิศชี้นำการตัดสินใจ (Guiding Framework)</span>
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                &ldquo;{decisionFramework}&rdquo;
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            {/* Catalyst Info */}
            <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/30 rounded-2xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                ตัวเร่งปฏิกิริยาประจำปี: ดาว{currentYearData?.sub_planet.thai}
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {subDetail?.catalyst_role ||
                  reading?.sub_narrative ||
                  "พลังงานประจำปีช่วยกระตุ้นการเจรจา การสร้างเครือข่าย และการเปิดรับโอกาสใหม่ๆ ที่เข้ามาอย่างรวดเร็ว"}
              </p>
              {subDetail?.window_opportunity && (
                <div className="mt-3 pt-3 border-t border-sky-200/60 dark:border-sky-800/40 text-xs text-sky-800 dark:text-sky-300 font-medium flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span><b>จังหวะทอง:</b> {subDetail.window_opportunity}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Focus vs Caution Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* Focus Points */}
          <div className="rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-200/70 dark:border-emerald-900/40 p-5">
            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>3 สิ่งที่ควรโฟกัสและลงมือทำในปีนี้</span>
            </h4>
            <ul className="space-y-2.5">
              {focusPoints.slice(0, 3).map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Caution Points */}
          <div className="rounded-2xl bg-rose-50/40 dark:bg-rose-950/15 border border-rose-200/70 dark:border-rose-900/40 p-5">
            <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>สิ่งที่ควรชะลอและระมัดระวังเป็นพิเศษ</span>
            </h4>
            <ul className="space-y-2.5">
              {cautionPoints.slice(0, 2).map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    !
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. The 3 Life Domains (Work, Money, Love) */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            3 เสาหลักของชีวิต (The 3 Life Pillars)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            การสังเคราะห์ตำแหน่งดาวและเรือนชะตาในมิติสำคัญของมนุษย์
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Career Pillar */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              การงานและความสำเร็จ
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              MC {chart.angles.Midheaven.sign_thai} • พลังขับเคลื่อนอาชีพ
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p>
                <b>ทิศทางที่รุ่ง:</b> งานที่ใช้การวางแผนเชิงกลยุทธ์ การบริหารจัดการ หรือการแก้ปัญหาที่มีความซับซ้อน
              </p>
              <p>
                <b>จุดแข็งเฉพาะตัว:</b> ความรอบคอบและวิสัยทัศน์ที่มองทะลุอนาคต สามารถสร้างระบบที่พึ่งพาได้จริง
              </p>
            </div>
          </div>

          {/* Wealth Pillar */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Coins className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              การเงินและความมั่งคั่ง
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ภพการเงินและดาวพฤหัสบดี
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p>
                <b>สไตล์การสร้างทรัพย์:</b> ทรัพย์สินเพิ่มพูนจากทักษะเฉพาะตัวและการลงทุนระยะยาวที่ผ่านการศึกษามาอย่างดี
              </p>
              <p>
                <b>ข้อควรระวัง:</b> หลีกเลี่ยงการเก็งกำไรที่มีความผันผวนสูง เน้นสร้างกระแสเงินสดที่สม่ำเสมอ
              </p>
            </div>
          </div>

          {/* Love & Synergy Pillar */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              ความสัมพันธ์และคู่ครอง
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ภพที่ 7 (ปัตนิ) & ดาวศุกร์
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p>
                <b>คนที่เกื้อหนุนดวง:</b> คู่คิดที่สามารถแลกเปลี่ยนความคิดเห็นได้อย่างเท่าเทียม มีความเข้าใจและให้เกียรติซึ่งกันและกัน
              </p>
              <p>
                <b>กุญแจความสัมพันธ์:</b> การสื่อสารด้วยความจริงใจและความเข้าใจในพื้นที่ส่วนตัวของแต่ละฝ่าย
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Deep Dive CTA Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-amber-300 text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            <span>สำหรับผู้ที่ต้องการข้อมูลและเครื่องมือระดับมืออาชีพ</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            ต้องการเจาะลึกองศาดาวและวงล้อพลาซิดัสฉบับเต็ม?
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            สลับไปยัง <b>โหมดนักโหราศาสตร์ (Pro Studio)</b> เพื่อสำรวจวงล้อ Placidus Chart Wheel แบบอินเทอร์แอคทีฟ, ตารางมหาทักษา 108 ปีแบบรายปี, ตัววิเคราะห์คู่ดาวและองศาผลกระทบเชิงลึก (Deep Aspect Dynamics)
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSwitchToPro}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>เปิดโหมดนักโหราศาสตร์ (Pro Studio)</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            {onSwitchToBazi && (
              <button
                type="button"
                onClick={onSwitchToBazi}
                className="px-5 py-2.5 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-700/60 text-emerald-300 font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>ปาจื่อ 4 เสาชะตา (Bazi)</span>
              </button>
            )}

            {onSwitchToAi && (
              <button
                type="button"
                onClick={onSwitchToAi}
                className="px-5 py-2.5 rounded-2xl bg-indigo-950/70 hover:bg-indigo-900/70 border border-indigo-700/60 text-indigo-300 font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>ปรึกษา AI Life Counselor</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExportPdf}
              disabled={isExporting}
              className="px-5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{isExporting ? "กำลังสร้าง PDF..." : "ดาวน์โหลด PDF 5 หน้า"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Astrology Reference Modal (ตารางคู่ดาว & ดาวประจำราศี) */}
      <AstrologyReferenceModal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        data={data.reference_tables}
      />
    </div>
  );
};
