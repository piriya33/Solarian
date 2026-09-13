import React, { useState } from "react";
import { Mail, KeyRound, ShieldCheck, X, Sparkles, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
  currentBirthData?: any;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentBirthData,
}) => {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saveCurrentChart, setSaveCurrentChart] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const payload: any = {
      email: email.trim(),
      password,
    };

    if (mode === "register" && saveCurrentChart && currentBirthData) {
      payload.profile = currentBirthData;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "เกิดข้อผิดพลาดในการยืนยันตัวตน");
      }

      // Save token to localStorage
      localStorage.setItem("solarian_token", data.access_token);
      onSuccess(data.user, data.access_token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "การเชื่อมต่อล้มเหลว กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden transition-all">
        {/* Subtle Cosmic Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {mode === "register" ? "สร้างบัญชี Solarian" : "ยินดีต้อนรับกลับสู่ Solarian"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === "register"
              ? "บันทึกดวงชะตาและเข้าถึงการวิเคราะห์เชิงลึกได้ทุกที่ทุกเวลา"
              : "เข้าสู่ระบบเพื่อเรียกดูดวงชะตาและการวิเคราะห์ที่คุณบันทึกไว้"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6 border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => { setMode("register"); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === "register"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            สมัครสมาชิก
          </button>
          <button
            type="button"
            onClick={() => { setMode("login"); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === "login"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            เข้าสู่ระบบ
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              อีเมล (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {mode === "register" && currentBirthData && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 cursor-pointer">
              <input
                type="checkbox"
                checked={saveCurrentChart}
                onChange={(e) => setSaveCurrentChart(e.target.checked)}
                className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 accent-amber-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                บันทึกข้อมูลดวงเกิดของ <b className="text-amber-700 dark:text-amber-300">{currentBirthData.name || "คุณ"}</b> ({currentBirthData.birth_date}) ลงในบัญชีนี้ทันที
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading
              ? "กำลังประมวลผล..."
              : mode === "register"
              ? "สร้างบัญชีและเข้ารหัสข้อมูล"
              : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* Privacy Assurance Banner */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <b>Privacy-First Standard:</b> ข้อมูลวันเกิด เวลาเกิด และพิกัดของคุณจะถูกเข้ารหัสแบบ <b>AES-256 (Fernet)</b> ทันทีที่เข้าสู่ระบบ โดยไม่มีการเปิดเผยพิกัดดิบสู่สาธารณะ
          </span>
        </div>
      </div>
    </div>
  );
};
