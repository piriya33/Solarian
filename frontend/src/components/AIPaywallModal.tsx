import React, { useState } from "react";
import {
  Sparkles,
  Crown,
  CheckCircle2,
  X,
  Zap,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

interface AIPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onUpgradeSuccess: (updatedUser: any) => void;
  currentTier?: string;
}

export const AIPaywallModal: React.FC<AIPaywallModalProps> = ({
  isOpen,
  onClose,
  token,
  onUpgradeSuccess,
  currentTier = "free",
}) => {

  const [selectedPlan, setSelectedPlan] = useState<"premium" | "pro">("premium");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateUpgrade = async (tier: "premium" | "pro") => {
    if (!token) {
      setErrorMsg("กรุณาเข้าสู่ระบบก่อนดำเนินการสมัครสมาชิก");
      return;
    }
    setIsUpgrading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/subscription/upgrade-simulation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "การอัปเกรดสมาชิกล้มเหลว");
      }

      const data = await res.json();
      onUpgradeSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการปรับสถานะสมาชิก");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden relative transition-all">
        {/* Ambient Cosmic Lights */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="p-6 sm:p-8 pb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              SOLARIAN STRATEGIC ADVISORY
              {currentTier && currentTier !== "free" ? ` • สถานะปัจจุบัน: ${currentTier.toUpperCase()}` : ""}
            </span>

          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ปลดล็อกที่ปรึกษาชีวิต <span className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">AI Life Counselor</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            ยกระดับการตัดสินใจทางธุรกิจ การงาน และชีวิตส่วนตัวด้วยพิมพ์เขียวข้าม 3 ศาสตร์ (Western + มหาทักษา 108 ปี + ดวงจีนปาจื่อ) ไร้ความงมงาย เน้นกลยุทธ์ปฏิบัติการจริง
          </p>
        </div>

        {errorMsg && (
          <div className="mx-6 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="p-6 sm:p-8 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto">
          {/* Plan 1: Premium */}
          <div
            onClick={() => setSelectedPlan("premium")}
            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              selectedPlan === "premium"
                ? "border-amber-500 bg-amber-500/5 shadow-lg dark:shadow-amber-950/30"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
            }`}
          >
            <div className="absolute top-3 right-3">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                ยอดนิยม
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Premium Monthly
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">สำหรับบุคคลที่ต้องการเข็มทิศชีวิตต่อเนื่อง</p>
                </div>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">฿290</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ เดือน</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>ยกเลิกได้ตลอดเวลา ไม่มีข้อผูกมัด</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>สร้าง <strong>Executive Life Blueprint</strong> ไม่จำกัด</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>แชทถามตอบเจาะลึก <strong>AI Counselor</strong> ไม่จำกัดครั้ง</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>วิเคราะห์วัยจร 108 ปีและจังหวะเสี่ยงล่วงหน้า</span>
                </li>
              </ul>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (currentTier !== "premium" && currentTier !== "pro") {
                  handleSimulateUpgrade("premium");
                }
              }}
              disabled={isUpgrading || currentTier === "premium" || currentTier === "pro"}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                currentTier === "premium" || currentTier === "pro"
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default"
                  : "bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white shadow-md shadow-amber-500/20 disabled:opacity-50"
              }`}
            >
              {isUpgrading && selectedPlan === "premium" ? (
                "กำลังดำเนินการ..."
              ) : currentTier === "premium" ? (
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> แพ็กเกจปัจจุบันของคุณ</span>
              ) : currentTier === "pro" ? (
                <span>รวมอยู่ในสิทธิ์ Pro แล้ว</span>
              ) : (
                <>
                  <span>เปิดใช้งาน Premium ทันที</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Plan 2: Pro Lifetime */}
          <div
            onClick={() => setSelectedPlan("pro")}
            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              selectedPlan === "pro"
                ? "border-indigo-500 bg-indigo-500/5 shadow-lg dark:shadow-indigo-950/30"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
            }`}
          >
            <div className="absolute top-3 right-3">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                คุ้มค่าสูงสุด
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Pro Executive
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">สำหรับผู้บริหาร นักธุรกิจ และผู้วางแผนครอบครัว</p>
                </div>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">฿990</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ ตลอดชีพ</span>
                </div>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>จ่ายครั้งเดียว เข้าถึงฟีเจอร์ใหม่ตลอดไป</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span><strong>ทุกอย่างใน Premium</strong> แบบถาวร</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>บันทึกดวงคนในครอบครัว & ทีมงานได้ <strong>ไม่จำกัดดวง</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>ดาวน์โหลด <strong>Full Astrological Dossier PDF</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>สิทธิ์เข้าถึงฟังก์ชัน AI Engine เวอร์ชันถัดไปก่อนใคร</span>
                </li>
              </ul>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (currentTier !== "pro") {
                  handleSimulateUpgrade("pro");
                }
              }}
              disabled={isUpgrading || currentTier === "pro"}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                currentTier === "pro"
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-md shadow-indigo-600/20 disabled:opacity-50"
              }`}
            >
              {isUpgrading && selectedPlan === "pro" ? (
                "กำลังดำเนินการ..."
              ) : currentTier === "pro" ? (
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> แพ็กเกจปัจจุบันของคุณ</span>
              ) : (
                <>
                  <span>เปิดใช้งาน Pro ตลอดชีพ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>ข้อมูลเวลาเกิดและดวงชะตาทุกชุดถูกเข้ารหัสด้วยเทคโนโลยี AES-256 ปลอดภัยและเป็นส่วนตัว 100%</span>
        </div>
      </div>
    </div>
  );
};
