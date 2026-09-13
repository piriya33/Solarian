import React, { useState } from "react";
import type { ReferenceTablesData, ZodiacSignRef } from "../types";
import { ZodiacIcon } from "./ZodiacIcon";
import {
  X,
  BookOpen,
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Users,
  Swords,
  Crown,
  Compass,
} from "lucide-react";

interface AstrologyReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: ReferenceTablesData | null;
}

// Fallback data if not passed from API
const FALLBACK_ZODIAC: ZodiacSignRef[] = [
  {
    id: 1, sign_en: "Aries", sign_thai: "เมษ", symbol: "♈", element: "ไฟ", element_color: "#ef4444",
    modality: "จรราศี (Cardinal)", modality_desc: "ผู้นำ ริเริ่ม บุกเบิก ขับเคลื่อน",
    traditional_ruler: { num: 3, name: "Mars", thai: "อังคาร", symbol: "♂" },
    modern_ruler: null,
    exaltation: { num: 1, name: "Sun", thai: "อาทิตย์", degree: "10°", level: "มหาอุจจ์" },
    detriment: { num: 6, name: "Venus", thai: "ศุกร์", level: "ประเกษตร" },
    fall: { num: 7, name: "Saturn", thai: "เสาร์", level: "นิจ" },
    keywords: "การบุกเบิก ความกล้าหาญ ความเป็นผู้นำ พลังริเริ่มเชิงรุก"
  },
  {
    id: 2, sign_en: "Taurus", sign_thai: "พฤษภ", symbol: "♉", element: "ดิน", element_color: "#eab308",
    modality: "สถิรราศี (Fixed)", modality_desc: "หนักแน่น มั่นคง สะสม รักษา",
    traditional_ruler: { num: 6, name: "Venus", thai: "ศุกร์", symbol: "♀" },
    modern_ruler: null,
    exaltation: { num: 2, name: "Moon", thai: "จันทร์", degree: "3°", level: "มหาอุจจ์" },
    detriment: { num: 3, name: "Mars", thai: "อังคาร", level: "ประเกษตร" },
    fall: null,
    keywords: "ความมั่นคง ความอุดมสมบูรณ์ การสะสมทรัพย์สิน ความอดทนสูง"
  },
  {
    id: 3, sign_en: "Gemini", sign_thai: "เมถุน", symbol: "♊", element: "ลม", element_color: "#06b6d4",
    modality: "อุภัยราศี (Mutable)", modality_desc: "ปรับตัว ยืดหยุ่น ลื่นไหล เชื่อมโยง",
    traditional_ruler: { num: 4, name: "Mercury", thai: "พุธ", symbol: "☿" },
    modern_ruler: null,
    exaltation: null,
    detriment: { num: 5, name: "Jupiter", thai: "พฤหัสบดี", level: "ประเกษตร" },
    fall: null,
    keywords: "การสื่อสาร ปฏิภาณไหวพริบ ความคิดสร้างสรรค์ การเชื่อมโยงเครือข่าย"
  },
  {
    id: 4, sign_en: "Cancer", sign_thai: "กรกฎ", symbol: "♋", element: "น้ำ", element_color: "#3b82f6",
    modality: "จรราศี (Cardinal)", modality_desc: "ริเริ่มจากอารมณ์ ปกป้อง สร้างรากฐาน",
    traditional_ruler: { num: 2, name: "Moon", thai: "จันทร์", symbol: "☽" },
    modern_ruler: null,
    exaltation: { num: 5, name: "Jupiter", thai: "พฤหัสบดี", degree: "5°", level: "มหาอุจจ์" },
    detriment: { num: 7, name: "Saturn", thai: "เสาร์", level: "ประเกษตร" },
    fall: { num: 3, name: "Mars", thai: "อังคาร", level: "นิจ" },
    keywords: "การดูแล รากฐานครอบครัว สัญชาตญาณลึกซึ้ง ความอบอุ่นปลอดภัย"
  },
  {
    id: 5, sign_en: "Leo", sign_thai: "สิงห์", symbol: "♌", element: "ไฟ", element_color: "#ef4444",
    modality: "สถิรราศี (Fixed)", modality_desc: "หนักแน่น เปล่งประกาย ศักดิ์ศรี",
    traditional_ruler: { num: 1, name: "Sun", thai: "อาทิตย์", symbol: "☉" },
    modern_ruler: null,
    exaltation: null,
    detriment: { num: 7, name: "Saturn", thai: "เสาร์", level: "ประเกษตร" },
    fall: null,
    keywords: "เกียรติยศ ความสง่างาม ความเป็นผู้นำโดยกำเนิด พลังดึงดูดใจ"
  },
  {
    id: 6, sign_en: "Virgo", sign_thai: "กันย์", symbol: "♍", element: "ดิน", element_color: "#eab308",
    modality: "อุภัยราศี (Mutable)", modality_desc: "วิเคราะห์ ปรับปรุง เพิ่มประสิทธิภาพ",
    traditional_ruler: { num: 4, name: "Mercury", thai: "พุธ", symbol: "☿" },
    modern_ruler: null,
    exaltation: { num: 4, name: "Mercury", thai: "พุธ", degree: "15°", level: "มหาอุจจ์" },
    detriment: { num: 5, name: "Jupiter", thai: "พฤหัสบดี", level: "ประเกษตร" },
    fall: { num: 6, name: "Venus", thai: "ศุกร์", level: "นิจ" },
    keywords: "ความประณีต วินัย การวิเคราะห์เชิงลึก การบริการและความสมบูรณ์แบบ"
  },
  {
    id: 7, sign_en: "Libra", sign_thai: "ตุลย์", symbol: "♎", element: "ลม", element_color: "#06b6d4",
    modality: "จรราศี (Cardinal)", modality_desc: "ริเริ่มสร้างความสมดุล เจรจา สัมพันธ์",
    traditional_ruler: { num: 6, name: "Venus", thai: "ศุกร์", symbol: "♀" },
    modern_ruler: null,
    exaltation: { num: 7, name: "Saturn", thai: "เสาร์", degree: "20°", level: "มหาอุจจ์" },
    detriment: { num: 3, name: "Mars", thai: "อังคาร", level: "ประเกษตร" },
    fall: { num: 1, name: "Sun", thai: "อาทิตย์", level: "นิจ" },
    keywords: "ความยุติธรรม ความสมดุล พันธมิตร ศิลปะและมนุษยสัมพันธ์"
  },
  {
    id: 8, sign_en: "Scorpio", sign_thai: "พิจิก", symbol: "♏", element: "น้ำ", element_color: "#3b82f6",
    modality: "สถิรราศี (Fixed)", modality_desc: "หยั่งลึก เข้มข้น พลังจิตแกร่งกล้า",
    traditional_ruler: { num: 3, name: "Mars", thai: "อังคาร", symbol: "♂" },
    modern_ruler: { name: "Pluto", thai: "พลูโต", symbol: "♇" },
    exaltation: null,
    detriment: { num: 6, name: "Venus", thai: "ศุกร์", level: "ประเกษตร" },
    fall: { num: 2, name: "Moon", thai: "จันทร์", level: "นิจ" },
    keywords: "การแปรสภาพ พลังจิตลึกซึ้ง ความลับ การฟื้นฟูและการเกิดใหม่"
  },
  {
    id: 9, sign_en: "Sagittarius", sign_thai: "ธนู", symbol: "♐", element: "ไฟ", element_color: "#ef4444",
    modality: "อุภัยราศี (Mutable)", modality_desc: "ขยายขอบเขต แสวงหาความรู้ วิสัยทัศน์",
    traditional_ruler: { num: 5, name: "Jupiter", thai: "พฤหัสบดี", symbol: "♃" },
    modern_ruler: null,
    exaltation: null,
    detriment: { num: 4, name: "Mercury", thai: "พุธ", level: "ประเกษตร" },
    fall: null,
    keywords: "วิสัยทัศน์กว้างไกล ปรัชญา การศึกษาชั้นสูง การเดินทางและคุณธรรม"
  },
  {
    id: 10, sign_en: "Capricorn", sign_thai: "มังกร", symbol: "♑", element: "ดิน", element_color: "#eab308",
    modality: "จรราศี (Cardinal)", modality_desc: "ริเริ่มสร้างระบบ โครงสร้าง ความมั่นคง",
    traditional_ruler: { num: 7, name: "Saturn", thai: "เสาร์", symbol: "♄" },
    modern_ruler: null,
    exaltation: { num: 3, name: "Mars", thai: "อังคาร", degree: "28°", level: "มหาอุจจ์" },
    detriment: { num: 2, name: "Moon", thai: "จันทร์", level: "ประเกษตร" },
    fall: { num: 5, name: "Jupiter", thai: "พฤหัสบดี", level: "นิจ" },
    keywords: "วินัย ความรับผิดชอบสูง สถาปัตยกรรมชีวิต ความสำเร็จที่ยั่งยืน"
  },
  {
    id: 11, sign_en: "Aquarius", sign_thai: "กุมภ์", symbol: "♒", element: "ลม", element_color: "#06b6d4",
    modality: "สถิรราศี (Fixed)", modality_desc: "หนักแน่นในอุดมการณ์ นวัตกรรมเพื่อสังคม",
    traditional_ruler: { num: 7, name: "Saturn", thai: "เสาร์", symbol: "♄" },
    modern_ruler: { name: "Uranus", thai: "มฤตยู / ยูเรนัส", symbol: "♅" },
    exaltation: null,
    detriment: { num: 1, name: "Sun", thai: "อาทิตย์", level: "ประเกษตร" },
    fall: null,
    keywords: "นวัตกรรม อิสรภาพ ความคิดก้าวหน้า มนุษยธรรม ชุมชนและอนาคต"
  },
  {
    id: 12, sign_en: "Pisces", sign_thai: "มีน", symbol: "♓", element: "น้ำ", element_color: "#3b82f6",
    modality: "อุภัยราศี (Mutable)", modality_desc: "ไร้ขอบเขต จินตนาการ ลื่นไหล ญาณทัศนะ",
    traditional_ruler: { num: 5, name: "Jupiter", thai: "พฤหัสบดี", symbol: "♃" },
    modern_ruler: { name: "Neptune", thai: "เนปจูน", symbol: "♆" },
    exaltation: { num: 6, name: "Venus", thai: "ศุกร์", degree: "27°", level: "มหาอุจจ์" },
    detriment: { num: 4, name: "Mercury", thai: "พุธ", level: "ประเกษตร" },
    fall: { num: 4, name: "Mercury", thai: "พุธ", level: "นิจ" },
    keywords: "จินตนาการ จิตวิญญาณ ความเมตตา ญาณทัศนะ ศิลปะและความสงบใจ"
  }
];

export const AstrologyReferenceModal: React.FC<AstrologyReferenceModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [activeTab, setActiveTab] = useState<"zodiac" | "pairs" | "thaksa">("pairs");
  const [pairGroup, setPairGroup] = useState<"friends" | "enemies" | "sompol" | "elements">("friends");
  const [elementFilter, setElementFilter] = useState<string>("all");

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const zodiacList = data?.zodiac_signs || FALLBACK_ZODIAC;
  const filteredZodiac = elementFilter === "all"
    ? zodiacList
    : zodiacList.filter((z) => z.element === elementFilter);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ref-modal-title"
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="ref-modal-title" className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                คลังความรู้และตารางอ้างอิงโหราศาสตร์ (Reference Library)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                มาตรฐานคัมภีร์โหราศาสตร์ไทย & ดาราศาสตร์สากล: ดาวประจำราศี, คู่มิตร-คู่ศัตรู, และภูมิทักษา
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Tabs */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 sm:px-6 pt-2 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("pairs")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "pairs"
                ? "border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-300 bg-white dark:bg-slate-900 rounded-t-xl"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4 text-amber-500 shrink-0" />
            <span>ตารางคู่ดาว (คู่มิตร / ศัตรู / สมพล / ธาตุ)</span>
          </button>

          <button
            onClick={() => setActiveTab("zodiac")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "zodiac"
                ? "border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-300 bg-white dark:bg-slate-900 rounded-t-xl"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
            <span>ตาราง 12 ราศี & ดาวเกษตร</span>
          </button>

          <button
            onClick={() => setActiveTab("thaksa")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "thaksa"
                ? "border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-300 bg-white dark:bg-slate-900 rounded-t-xl"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>ภูมิทักษา 8 ภูมิ (บริวาร ถึง กาลกิณี)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PLANETARY PAIRS */}
          {activeTab === "pairs" && (
            <div className="space-y-6">
              {/* Sub-Tabs for Pair Groups */}
              <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setPairGroup("friends")}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    pairGroup === "friends"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>คู่มิตร</span>
                </button>
                <button
                  onClick={() => setPairGroup("enemies")}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    pairGroup === "enemies"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Swords className="w-4 h-4" />
                  <span>คู่ศัตรู / อริ</span>
                </button>
                <button
                  onClick={() => setPairGroup("sompol")}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    pairGroup === "sompol"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>คู่สมพล (กำลัง ๒๗)</span>
                </button>
                <button
                  onClick={() => setPairGroup("elements")}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    pairGroup === "elements"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>คู่ธาตุ</span>
                </button>
              </div>

              {/* Classical Verse Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50/40 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 border border-amber-200 dark:border-amber-700/50">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>บทกลอนโบราณตามคัมภีร์โหราศาสตร์ไทย</span>
                </p>
                <blockquote className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 italic leading-relaxed">
                  {pairGroup === "friends" && "“อาทิตย์เป็นมิตรกับครู จันทร์โฉมตรูพุธนงเยาว์ ศุกร์ปากหวานอังคารขี้เหงา ราหูกับเสาร์เป็นมิตรแก่กัน”"}
                  {pairGroup === "enemies" && "“อาทิตย์ผิดกับอังคาร พุธพาลราหู ศุกร์เสาร์เป็นศัตรู จันทร์กับครูเป็นอริ”"}
                  {pairGroup === "sompol" && "“กำลังร่วม ๒๗: อาทิตย์กับศุกร์ (๑-๖) จันทร์กับราหู (๒-๘) อังคารกับพฤหัสบดี (๓-๕) พุธกับเสาร์ (๔-๗) และพฤหัสบดีกับเสาร์ (๕-๗)”"}
                  {pairGroup === "elements" && "“อาทิตย์เสาร์คู่ธาตุไฟ จันทร์ครูคู่ธาตุดิน อังคารราหูคู่ธาตุลม พุธศุกร์คู่ธาตุน้ำ”"}
                </blockquote>
              </div>

              {/* Cards for Active Pair Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pairGroup === "friends" && [
                  { pair: "อาทิตย์ (๑) - พฤหัสบดี (๕)", type: "คู่มิตรใหญ่", desc: "ผู้ใหญ่อุปถัมภ์ ปัญญา เกียรติยศ และศีลธรรมอันมั่นคง ส่งเสริมชื่อเสียงและความก้าวหน้าในตำแหน่งหน้าที่", advice: "ปรึกษาผู้ทรงคุณวุฒิ ใช้ความรอบรู้และจริยธรรมนำการตัดสินใจ จะได้รับความไว้วางใจระดับสูง" },
                  { pair: "จันทร์ (๒) - พุธ (๔)", type: "คู่มิตรเสน่ห์และวาจา", desc: "การเจรจาพาที การค้า มนุษยสัมพันธ์ เสน่ห์เมตตามหานิยม ความเข้าอกเข้าใจผู้อื่นอย่างลึกซึ้ง", advice: "ใช้การสื่อสารที่นุ่มนวล สร้างพันธมิตรทางการค้า งานบริการและงานประสานงานจะสำเร็จราบรื่น" },
                  { pair: "อังคาร (๓) - ศุกร์ (๖)", type: "คู่มิตรชื่นบานและความรัก", desc: "ความรัก เสน่หา ศิลปะ ความสดใส มีชีวิตชีวา ความสุขสำราญ และความเพลิดเพลินในชีวิต", advice: "ใช้พลังสร้างสรรค์และความสดใสในการสร้างผลงาน ระวังความใจเร็วในการใช้จ่ายและอารมณ์เสน่หา" },
                  { pair: "เสาร์ (๗) - ราหู (๘)", type: "คู่มิตรนักเลงและบารมี", desc: "พรรคพวก ใจถึง บารมี ลาภลอย การเสี่ยงโชค เกื้อหนุนกันอย่างเหนียวแน่นในยามคับขันหรือโครงการเสี่ยง", advice: "บริหารบริวารและเครือข่ายอย่างจริงใจ พลิกแพลงกลยุทธ์ในยามวิกฤต กล้าได้กล้าเสียอย่างมีวินัย" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-500/20 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">{item.pair}</span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      💡 <strong>กลยุทธ์:</strong> {item.advice}
                    </div>
                  </div>
                ))}

                {pairGroup === "enemies" && [
                  { pair: "อาทิตย์ (๑) - อังคาร (๓)", type: "คู่ศัตรูแตกหัก", desc: "ความขัดแย้ง โทสะ อารมณ์ฉุนเฉียว การแตกหัก อุบัติเหตุ ผ่าตัด ความใจร้อนและข้อพิพาททางอำนาจ", advice: "ชะลอการตอบโต้ มีสติควบคุมโทสะ อย่าเอาชนะด้วยความรุนแรง ตรวจสอบความปลอดภัยในการเดินทาง" },
                  { pair: "พุธ (๔) - ราหู (๘)", type: "คู่ศัตรูเล่ห์เหลี่ยม", desc: "เอกสารสัญญาผิดพลาด การหลอกลวง คำพูดบิดเบือน คดีความ การถูกหักหลังและเสียชื่อเสียง", advice: "อ่านสัญญาอย่างละเอียดทุกบรรทัด ยืนยันข้อตกลงเป็นลายลักษณ์อักษร อย่าไว้ใจคำพูดลอยๆ" },
                  { pair: "ศุกร์ (๖) - เสาร์ (๗)", type: "คู่ศัตรูความรัก", desc: "รักซ้อน อุปสรรคความรัก การพลัดพราก ความกดดันทางอารมณ์ การเงินฝืดเคืองหรือเสียทรัพย์เพราะความรัก", advice: "แยกเรื่องงานและการเงินออกจากความสัมพันธ์ อย่าใช้อารมณ์ตัดสินใจเรื่องเงิน วางแผนการเงินอย่างรัดกุม" },
                  { pair: "จันทร์ (๒) - พฤหัสบดี (๕)", type: "คู่อริทัศนะ", desc: "ความขัดแย้งทางความคิด อารมณ์สวนทางหลักการ ขัดใจผู้ใหญ่หรือคนในครอบครัว ทัศนะทางศีลธรรมไม่ตรงกัน", advice: "รับฟังผู้ใหญ่ด้วยความเคารพ แยกแยะอารมณ์ส่วนตัวออกจากหลักการเหตุผล ประนีประนอมบนความถูกต้อง" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-rose-200/80 dark:border-rose-500/20 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">{item.pair}</span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-rose-700 dark:text-rose-400 font-medium">
                      🛡️ <strong>วิธีป้องกัน:</strong> {item.advice}
                    </div>
                  </div>
                ))}

                {pairGroup === "sompol" && [
                  { pair: "อาทิตย์ (๑) - ศุกร์ (๖)", type: "ยศศักดิ์และความมั่งคั่ง (กำลัง 27)", desc: "ความสง่างาม ยศศักดิ์ การเงินโดดเด่น ความมั่งคั่ง เกียรติภูมิทางสังคม และความมีระดับ", advice: "สร้างแบรนด์ส่วนบุคคล ยกระดับภาพลักษณ์ นำเสนอผลงานระดับพรีเมียม จะได้รับการยอมรับกว้างขวาง" },
                  { pair: "จันทร์ (๒) - ราหู (๘)", type: "ปฏิภาณไหวพริบและโชคลาภ (กำลัง 27)", desc: "ไหวพริบปฏิภาณเฉียบไว โชคลาภฉับพลัน แก้ไขวิกฤตเฉพาะหน้าได้ดีเยี่ยม พลิกแพลงสถานการณ์ได้รวดเร็ว", advice: "ใช้สัญชาตญาณและความยืดหยุ่นในการแก้ปัญหาเฉพาะหน้า มองหาโอกาสที่ซ่อนอยู่ในวิกฤต" },
                  { pair: "อังคาร (๓) - พฤหัสบดี (๕)", type: "ความกล้าหาญคู่คุณธรรม (กำลัง 27)", desc: "ความกล้าหาญพร้อมสติปัญญา สติปัญญานำกำลังกาย ชัยชนะจากการแข่งขันอย่างมีศักดิ์ศรีและความยุติธรรม", advice: "วางแผนเชิงกลยุทธ์ก่อนลงมือทำ ใช้กำลังและความมุ่งมั่นไปในทางสร้างสรรค์และชอบธรรม" },
                  { pair: "พุธ (๔) - เสาร์ (๗)", type: "ความสุขุมและโครงการใหญ่ (กำลัง 27)", desc: "ความสุขุม รอบคอบ งานโครงการขนาดใหญ่ การวางแผนระยะยาว วินัยสูง ความละเอียดรอบคอบ", advice: "สร้างระบบงานระยะยาว ทำงานเชิงโครงสร้างและวิจัย บริหารงานขนาดใหญ่ด้วยความอดทน" },
                  { pair: "พฤหัสบดี (๕) - เสาร์ (๗)", type: "คู่ปฏิรูปโครงสร้างครั้งใหญ่", desc: "การเปลี่ยนแปลงโครงสร้างครั้งใหญ่ การยกระดับบทบาทสู่ผู้บริหารหรือที่ปรึกษา การจัดระเบียบทรัพย์สินใหม่", advice: "ปรับปรุงระบบองค์กรหรือแผนการเงินระยะยาว เปลี่ยนผ่านสู่บทบาทผู้วางนโยบายและถ่ายทอดปัญญา" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-purple-200/80 dark:border-purple-500/20 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">{item.pair}</span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/50">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-purple-700 dark:text-purple-400 font-medium">
                      🚀 <strong>พลังขับเคลื่อน:</strong> {item.advice}
                    </div>
                  </div>
                ))}

                {pairGroup === "elements" && [
                  { pair: "อาทิตย์ (๑) - เสาร์ (๗)", type: "คู่ธาตุไฟ", desc: "พลังแห่งการสร้างสรรค์ ความกระตือรือร้น ความมุ่งมั่นอันแรงกล้า ไม่ย่อท้อต่อความยากลำบาก", advice: "ใช้ความเพียรในการสร้างผลงานชิ้นสำคัญ ยืนหยัดในเป้าหมายระยะยาวด้วยพลังใจที่ไม่มอดดับ" },
                  { pair: "จันทร์ (๒) - พฤหัสบดี (๕)", type: "คู่ธาตุดิน", desc: "ความมั่นคง อุดมสมบูรณ์ รากฐานที่แข็งแกร่ง ความน่าเชื่อถือ จิตใจหนักแน่นและเยือกเย็น", advice: "สะสมสินทรัพย์ที่จับต้องได้ สร้างฐานความรู้และรากฐานชีวิตที่มั่นคงถาวร" },
                  { pair: "อังคาร (๓) - ราหู (๘)", type: "คู่ธาตุลม", desc: "ความรวดเร็ว ว่องไว การเปลี่ยนแปลง การบุกเบิก การลุยไปข้างหน้าอย่างเด็ดขาดและเฉียบคม", advice: "คว้าโอกาสที่ผ่านเข้ามาอย่างรวดเร็ว ปรับตัวตามกระแสโลก ลุยงานที่ต้องการความฉับไว" },
                  { pair: "พุธ (๔) - ศุกร์ (๖)", type: "คู่ธาตุน้ำ", desc: "ความร่มเย็น อ่อนโยน เสน่ห์เมตตา ความอุดมสมบูรณ์ ความลื่นไหล และศิลปะการประนีประนอม", advice: "ใช้มนุษยสัมพันธ์สร้างบรรยากาศที่อบอุ่น ผ่อนคลายความตึงเครียดด้วยศิลปะและการสื่อสารที่งดงาม" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-amber-200/80 dark:border-amber-500/20 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">{item.pair}</span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-amber-700 dark:text-amber-400 font-medium">
                      ✨ <strong>พลังธาตุ:</strong> {item.advice}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ZODIAC SIGNS */}
          {activeTab === "zodiac" && (
            <div className="space-y-6">
              {/* Element Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">กรองตามธาตุ:</span>
                <button
                  onClick={() => setElementFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    elementFilter === "all"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  ทั้งหมด (12 ราศี)
                </button>
                <button
                  onClick={() => setElementFilter("ไฟ")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    elementFilter === "ไฟ"
                      ? "bg-rose-600 text-white"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>ธาตุไฟ (เมษ สิงห์ ธนู)</span>
                </button>
                <button
                  onClick={() => setElementFilter("ดิน")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    elementFilter === "ดิน"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
                  }`}
                >
                  <Mountain className="w-3.5 h-3.5" />
                  <span>ธาตุดิน (พฤษภ กันย์ มังกร)</span>
                </button>
                <button
                  onClick={() => setElementFilter("ลม")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    elementFilter === "ลม"
                      ? "bg-cyan-600 text-white"
                      : "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40"
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span>ธาตุลม (เมถุน ตุลย์ กุมภ์)</span>
                </button>
                <button
                  onClick={() => setElementFilter("น้ำ")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    elementFilter === "น้ำ"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40"
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>ธาตุน้ำ (กรกฎ พิจิก มีน)</span>
                </button>
              </div>

              {/* Responsive Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredZodiac.map((z) => (
                  <div
                    key={z.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3 hover:border-amber-400 dark:hover:border-amber-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ZodiacIcon sign={z.sign_en} size={28} />
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-1">
                            <span>{z.sign_thai}</span>
                            <span className="text-xs text-slate-400 font-normal">({z.sign_en})</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{z.modality}</p>
                        </div>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-bold border"
                        style={{
                          backgroundColor: `${z.element_color}15`,
                          color: z.element_color,
                          borderColor: `${z.element_color}40`,
                        }}
                      >
                        ธาตุ{z.element}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">ดาวเกษตร (เจ้าเรือน):</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {z.traditional_ruler.thai} ({z.traditional_ruler.symbol})
                        </span>
                      </div>

                      {z.modern_ruler && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">ดาวครองราศีสากล:</span>
                          <span className="font-semibold text-sky-600 dark:text-sky-400">
                            {z.modern_ruler.thai} ({z.modern_ruler.symbol})
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">มหาอุจจ์ (โดดเด่น):</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {z.exaltation ? `${z.exaltation.thai} ${z.exaltation.degree || ""}` : "—"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">ประเกษตร (ตรงข้าม):</span>
                        <span className="text-orange-600 dark:text-orange-400">
                          {z.detriment ? z.detriment.thai : "—"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">นิจ (พลังอ่อน/เพียร):</span>
                        <span className="text-rose-600 dark:text-rose-400">
                          {z.fall ? z.fall.thai : "—"}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      “{z.keywords}”
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: THAKSA ROLES */}
          {activeTab === "thaksa" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <strong className="text-amber-900 dark:text-amber-300">หลักมหาทักษาพยากรณ์:</strong> มี 8 ภูมิเวียนตามลำดับ เริ่มต้นจากดาวครองวันเกิดเป็นภูมิ <em>บริวาร</em> เวียนไปตามลำดับ (บริวาร → อายุ → เดช → ศรี → มูละ → อุตสาหะ → มนตรี → กาลกิณี) เมื่อคำนวณทักษาจรประจำปี ดาวใดตกภูมิต่างๆ จะส่งอิทธิพลต่อชีวิตในมิตินั้นๆ
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { thai: "บริวาร", key: "barivari", color: "#3b82f6", desc: "คนรอบข้าง บุตร บริวาร ผู้ใต้บังคับบัญชา ผู้สนับสนุน เพื่อนร่วมงาน", detail: "สะท้อนถึงการบริหารคน ทีมงาน และมิตรภาพ เมื่อดาวจรมาตกภูมิบริวาร จะส่งผลต่อความสัมพันธ์กับคนรอบข้างและการได้รับแรงสนับสนุนจากทีม" },
                  { thai: "อายุ", key: "ayu", color: "#10b981", desc: "สุขภาพ ร่างกาย ความเป็นอยู่ กำลังวังชา พลานามัย สภาพจิตใจ", detail: "สะท้อนถึงพลังงานชีวิต สุขภาพร่างกาย และการดำเนินชีวิตประจำวัน หากมีดาวบาปเคราะห์จรมาตก ต้องระมัดระวังเรื่องสุขภาพและการพักผ่อน" },
                  { thai: "เดช", key: "dech", color: "#f59e0b", desc: "อำนาจบารมี ชัยชนะ เกียรติยศ ชื่อเสียง ความหนักแน่น ความเป็นผู้นำ", detail: "สะท้อนถึงพลังอำนาจ การตัดสินใจเด็ดขาด และการได้รับการยอมรับนับถือ เหมาะแก่การนำทัพ เจรจาต่อรอง หรือสอบแข่งขัน" },
                  { thai: "ศรี", key: "sri", color: "#ec4899", desc: "สิริมงคล โชคลาภ ทรัพย์สิน เสน่ห์ ความเจริญรุ่งเรือง ความสำเร็จ", detail: "ภูมิยอดมงคล นำพาโชคลาภ ทรัพย์สิน ความราบรื่น และความเมตตาเอ็นดู การเริ่มต้นสิ่งใหม่ในช่วงดาวศรีส่งผลจะสำเร็จสมหวังได้ง่าย" },
                  { thai: "มูละ", key: "mula", color: "#8b5cf6", desc: "หลักทรัพย์ ฐานะ มรดก หลักแหล่ง ความมั่นคง ที่อยู่อาศัย ที่ดิน", detail: "สะท้อนถึงความมั่นคงในชีวิต ทรัพย์สินชิ้นใหญ่ อสังหาริมทรัพย์ และการสร้างรากฐานครอบครัวที่แข็งแรง" },
                  { thai: "อุตสาหะ", key: "utsaha", color: "#06b6d4", desc: "ความขยันหมั่นเพียร การงาน การลงแรง ความคิดริเริ่ม ความมุ่งมั่น", detail: "สะท้อนถึงภาระหน้าที่ การตรากตรำทำงานหนัก และการใช้ความพยายามขับเคลื่อนเป้าหมาย ความสำเร็จต้องแลกมาด้วยหยาดเหงื่อ" },
                  { thai: "มนตรี", key: "montri", color: "#14b8a6", desc: "ผู้อุปถัมภ์ค้ำชู ที่ปรึกษา ผู้ใหญ่ให้ความเมตตา ความช่วยเหลือ ครูอาจารย์", detail: "สะท้อนถึงการได้รับการสนับสนุนจากผู้หลักผู้ใหญ่ ที่ปรึกษาผู้ทรงภูมิ และความช่วยเหลือในยามติดขัด" },
                  { thai: "กาลกิณี", key: "kalakini", color: "#ef4444", desc: "อุปสรรค จุดบกพร่อง ความขัดแย้ง สิ่งที่ต้องระมัดระวังเป็นพิเศษ", detail: "ภูมิแห่งความท้าทาย ชี้ชัดถึงจุดบกพร่อง อุปสรรค หรือความเสี่ยงที่ไม่ควรมองข้าม ควรใช้ชีวิตด้วยสติ ไม่ประมาท และบริหารความเสี่ยงอย่างรัดกุม" },
                ].map((role, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: role.color }} />
                        ภูมิ{role.thai}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ลำดับที่ {idx + 1}</span>
                    </div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{role.desc}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      {role.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ระบบอ้างอิงโหราศาสตร์ Solarian Astrology Engine (Swiss Ephemeris & Thai Maha Thaksa)
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 transition-all"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
