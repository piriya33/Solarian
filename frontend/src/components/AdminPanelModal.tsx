import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  RefreshCw,
  X,
  Crown,
  Zap,
  CheckCircle2,
  AlertCircle,
  Search
} from "lucide-react";


interface AdminUser {
  id: number;
  email: string;
  role: "admin" | "user";
  subscription_tier: "free" | "premium" | "pro";
  ai_queries_count: number;
  created_at?: string;
}

interface AdminStats {
  total_users: number;
  total_profiles: number;
  total_ai_queries: number;
  admin_users: number;
  paid_subscribers: number;
}

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  token,
}) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersRes.ok || !statsRes.ok) {
        throw new Error("ไม่มีสิทธิ์เข้าถึงแดชบอร์ดแอดมิน หรือเซสชันหมดอายุ");
      }

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      setUsers(usersData);
      setStats(statsData);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลแอดมิน");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen, token]);

  const handleUpdateTier = async (
    userId: number,
    tier: string,
    role?: string
  ) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/tier`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "ไม่สามารถอัปเดตสิทธิ์ผู้ใช้ได้");
      }

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updated.user } : u))
      );
      setActionSuccess(`อัปเดตสิทธิ์สำหรับ ${updated.user.email} เรียบร้อยแล้ว`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "การปรับปรุงสิทธิ์ล้มเหลว");
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden relative transition-all">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                แผงควบคุมระบบและสิทธิ์ผู้ใช้
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-medium">
                  Admin Central
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                จัดการสมาชิก กำหนดระดับสิทธิ์การเข้าถึง AI และตรวจดูสถิติระบบ Solarian
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Toasts */}
        {actionSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* System Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 pb-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" /> สมาชิกทั้งหมด
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {stats.total_users} <span className="text-xs font-normal text-slate-400">คน</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" /> สมาชิกเสียค่าบริการ
              </div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {stats.paid_subscribers} <span className="text-xs font-normal text-slate-400">คน</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-500" /> การเรียกใช้ AI รวม
              </div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.total_ai_queries} <span className="text-xs font-normal text-slate-400">ครั้ง</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> แอดมินระบบ
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {stats.admin_users} <span className="text-xs font-normal text-slate-400">คน</span>
              </div>
            </div>
          </div>
        )}

        {/* Search and Table Container */}
        <div className="px-6 py-2 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาด้วยอีเมล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <div className="text-xs text-slate-400">
            แสดง {filteredUsers.length} จาก {users.length} รายการ
          </div>
        </div>

        {/* Users Table */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">ID / อีเมล</th>
                  <th className="py-3 px-4 font-semibold">บทบาท (Role)</th>
                  <th className="py-3 px-4 font-semibold">แพ็กเกจ (Tier)</th>
                  <th className="py-3 px-4 font-semibold text-center">AI Quota</th>
                  <th className="py-3 px-4 font-semibold text-right">ปรับเปลี่ยนสิทธิ์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลสมาชิก
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {u.email}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ID: #{u.id} {u.created_at && `• ${u.created_at.slice(0, 10)}`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            u.role === "admin"
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {u.role === "admin" ? (
                            <>
                              <ShieldAlert className="w-3 h-3" /> แอดมิน
                            </>
                          ) : (
                            "ผู้ใช้ทั่วไป"
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            u.subscription_tier === "pro"
                              ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800"
                              : u.subscription_tier === "premium"
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {u.subscription_tier === "pro" && <Crown className="w-3 h-3" />}
                          {u.subscription_tier === "premium" && <Zap className="w-3 h-3" />}
                          {u.subscription_tier.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                          {u.ai_queries_count}
                        </span>
                        <span className="text-[10px] text-slate-400 block">ครั้ง</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Tier change buttons */}
                          <button
                            onClick={() => handleUpdateTier(u.id, "free")}
                            className={`px-2 py-1 rounded-lg text-[10px] transition-all ${
                              u.subscription_tier === "free"
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-bold"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            }`}
                          >
                            Free
                          </button>
                          <button
                            onClick={() => handleUpdateTier(u.id, "premium")}
                            className={`px-2 py-1 rounded-lg text-[10px] transition-all ${
                              u.subscription_tier === "premium"
                                ? "bg-amber-500 text-white font-bold shadow-sm"
                                : "hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            Premium
                          </button>
                          <button
                            onClick={() => handleUpdateTier(u.id, "pro")}
                            className={`px-2 py-1 rounded-lg text-[10px] transition-all ${
                              u.subscription_tier === "pro"
                                ? "bg-indigo-600 text-white font-bold shadow-sm"
                                : "hover:bg-indigo-100 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            Pro
                          </button>

                          {/* Role Toggle */}
                          <button
                            onClick={() =>
                              handleUpdateTier(
                                u.id,
                                u.subscription_tier,
                                u.role === "admin" ? "user" : "admin"
                              )
                            }
                            className={`ml-2 px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                              u.role === "admin"
                                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                            title="สลับสิทธิ์ Admin / User"
                          >
                            {u.role === "admin" ? "ปลดแอดมิน" : "ตั้งเป็นแอดมิน"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
