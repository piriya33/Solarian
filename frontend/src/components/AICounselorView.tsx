import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Key,
  HelpCircle,
  RefreshCw,
  User as UserIcon,
  CheckCircle2,
  X,
  Trash2,
  Crown,
  Lock,
  ArrowRight,
  Zap
} from 'lucide-react';

import { MarkdownRenderer } from './MarkdownRenderer';
import type { User } from '../types';

interface AICounselorViewProps {
  currentParams: any;
  user?: User | null;
  token?: string | null;
  onOpenPaywall?: () => void;
  onOpenAuth?: () => void;
  onUserUpdated?: (updatedUser: User) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  source?: string;
  timestamp: string;
}

export const AICounselorView: React.FC<AICounselorViewProps> = ({
  currentParams,
  user,
  token,
  onOpenPaywall,
  onOpenAuth,
  onUserUpdated,
}) => {
  const [reading, setReading] = useState<string | null>(null);
  const [readingSource, setReadingSource] = useState<string | null>(null);
  const [isLoadingReading, setIsLoadingReading] = useState(false);
  const [paywallNotice, setPaywallNotice] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSendingChat]);

  // Optional custom Gemini API Key override
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('solarian_gemini_key') || '';
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSaveKey = () => {
    localStorage.setItem('solarian_gemini_key', tempKey.trim());
    setApiKey(tempKey.trim());
    setShowKeyModal(false);
  };

  const handleGenerateReading = async () => {
    if (!user) {
      onOpenAuth?.();
      return;
    }

    setPaywallNotice(null);
    setIsLoadingReading(true);
    try {
      const res = await fetch('/api/ai/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          chart_params: currentParams,
          api_key: apiKey || undefined,
        }),
      });

      const data = await res.json();

      if (data.status === 'auth_required') {
        onOpenAuth?.();
        return;
      }

      if (data.status === 'paywall_required') {
        setPaywallNotice(
          data.message ||
            'คุณได้ใช้สิทธิ์ทดลองฟรีครบแล้ว กรุณาอัปเกรดเป็น Premium เพื่อเข้าถึง AI Life Counselor ไม่จำกัด'
        );
        onOpenPaywall?.();
        return;
      }

      if (res.ok && data.reading) {
        setReading(data.reading);
        setReadingSource(
          data.source === 'gemini'
            ? 'Google Gemini 2.5 Flash'
            : 'Solarian Strategic Synthesis'
        );

        if (user && data.ai_queries_count !== undefined && onUserUpdated) {
          onUserUpdated({
            ...user,
            ai_queries_count: data.ai_queries_count,
          });
        }
      }
    } catch (err) {
      console.error('Error generating AI reading:', err);
    } finally {
      setIsLoadingReading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuestion).trim();
    if (!q || isSendingChat) return;

    if (!user) {
      onOpenAuth?.();
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          chart_params: currentParams,
          question: q,
          api_key: apiKey || undefined,
        }),
      });

      const data = await res.json();

      if (data.status === 'auth_required') {
        onOpenAuth?.();
        return;
      }

      if (data.status === 'paywall_required') {
        setPaywallNotice(data.message);
        onOpenPaywall?.();
        return;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text:
          data.answer ||
          'ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำตอบ กรุณาลองใหม่อีกครั้งครับ',
        source: data.source === 'gemini' ? 'Gemini 2.5' : 'Strategic Engine',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (user && data.ai_queries_count !== undefined && onUserUpdated) {
        onUserUpdated({
          ...user,
          ai_queries_count: data.ai_queries_count,
        });
      }
    } catch (err) {
      console.error('Error in AI chat:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  const sampleQuestions = [
    '💼 วิเคราะห์จังหวะการงานและการลงทุนในปีนี้',
    '❤️ สไตล์คู่ครองและจุดเสริมความสัมพันธ์ตามพื้นดวง',
    '🛡️ ข้อควรระวังและวิธีบริหารเอนโทรปีในชีวิต',
    '🎯 ควรกำหนดเป้าหมายหลัก 90 วันนี้อย่างไร',
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner & Status Bar */}
      <section className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-amber-500/20 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Astrological Life Counselor</span>
              </span>

              {/* Membership Status Badge */}
              {user ? (
                user.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
                    <Crown className="w-3.5 h-3.5" /> แอดมิน (สิทธิ์ไม่จำกัด)
                  </span>
                ) : user.subscription_tier === 'pro' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                    <Crown className="w-3.5 h-3.5" /> Pro Executive Member
                  </span>
                ) : user.subscription_tier === 'premium' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    <Zap className="w-3.5 h-3.5" /> Premium Member
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-slate-300 text-xs">
                    <span>สิทธิ์ทดลองฟรี (ใช้แล้ว {user.ai_queries_count}/1 ครั้ง)</span>
                    <button
                      onClick={onOpenPaywall}
                      className="text-amber-400 font-bold hover:underline cursor-pointer ml-1"
                    >
                      อัปเกรด
                    </button>
                  </span>
                )
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 hover:bg-amber-500/50 border border-amber-400 text-amber-200 text-xs font-bold cursor-pointer transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบเพื่อใช้งาน</span>
                </button>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              ที่ปรึกษาการวางแผนชีวิตด้วยปัญญาประดิษฐ์
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              ผสาน 3 มหาศาสตร์ (สากล Placidus, มหาทักษา 108 ปี, ปาจื่อ 4 เสา) เข้ากับ Google Gemini API ในระดับเซิร์ฟเวอร์ เพื่อวิเคราะห์กลยุทธ์เฉพาะบุคคลและตอบคำถามชีวิตอย่างลึกซึ้ง
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {(!user || user.subscription_tier === 'free') && (
              <button
                type="button"
                onClick={onOpenPaywall}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
              >
                <Crown className="w-4 h-4" />
                <span>สมัครสมาชิกพรีเมียม</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setTempKey(apiKey);
                setShowKeyModal(true);
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white flex items-center gap-2 cursor-pointer transition-all"
              title="ตั้งค่า API Key ส่วนตัว (ทางเลือก)"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{apiKey ? 'Custom Key: มี' : 'Custom Key'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Token Protection Lock Notice Banner */}
      {(!user || user.subscription_tier === 'free') && !apiKey && (
        <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/40 border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 font-bold shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold mb-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>โหมดจำกัดโควตา Token (เร็วๆ นี้)</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  ระบบการตีความด้วย AI กำลังเตรียมเปิดตัว
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-xl leading-relaxed">
                  ขณะนี้ระบบจำกัดโควตาไว้ชั่วคราวเพื่อป้องกัน Token หมด คุณสามารถดูตัวอย่างหลักการวิเคราะห์ หรืออัปเกรดเพื่อรับสิทธิ์ใช้งานก่อนใคร
                </p>
              </div>
            </div>
            <button
              onClick={onOpenPaywall}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md self-start sm:self-center shrink-0"
            >
              <Crown className="w-4 h-4" />
              <span>ดูแพ็กเกจสมาชิก / ปลดล็อก</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">1. ดาวกระทบ 8 ดวงเดิม</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                วิเคราะห์เจ้าเรือน, ภพที่สถิต, ตำแหน่งมหาทักษาเดิม และคู่ดาวสัมพันธ์ (มิตร ศัตรู สมพล ธาตุ)
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">2. มหาทักษา 108 ปี</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                วิเคราะห์ดาวเสวยอายุและดาวแทรก สัมพันธ์กับภพเดิม ทักษาเดิม และพลวัตคู่ดาวของยุค
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">3. ดาวจร & ฐาน 30° จริง</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                คำนวณแบบดาราศาสตร์แท้จริง (DE431) และ True Solar Arc ให้ AI ร้อยเรียงคำทำนายจากภาพใหญ่ไปหาภาพเล็ก
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Paywall Notice Alert if Triggered */}
      {paywallNotice && (
        <section className="rounded-3xl p-6 bg-gradient-to-r from-amber-500/15 to-indigo-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                ปลดล็อก AI Life Counselor ฉบับเต็ม
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {paywallNotice}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPaywall}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md self-start sm:self-center"
          >
            <span>ดูแพ็กเกจสมาชิก</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* Part 1: Strategic AI Blueprint Generation */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-500" />
              <span>รายงานพิมพ์เขียวกลยุทธ์ชีวิตเชิงลึก (AI Life Blueprint)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              วิเคราะห์ตัวตน จังหวะชีวิต 3 เสาหลักความสำเร็จ และแผนปฏิบัติการ 90 วัน
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateReading}
            disabled={isLoadingReading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoadingReading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังประมวลผลดวงดาว...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{reading ? 'สร้างรายงานใหม่' : 'สร้างรายงานกลยุทธ์ชีวิต'}</span>
              </>
            )}
          </button>
        </div>

        {reading ? (
          <div className="mt-4 p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>ประมวลผลสมบูรณ์ ({readingSource})</span>
              </span>
              <span className="text-[11px] text-slate-400">
                สำหรับ: {currentParams.name || 'เจ้าชะตา'}
              </span>
            </div>

            <div className="text-slate-700 dark:text-slate-300">
              <MarkdownRenderer content={reading} />
            </div>
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 border border-dashed border-slate-200 dark:border-slate-800">
            <Bot className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              ยังไม่มีรายงานที่ถูกสร้างขึ้นในรอบนี้
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {user ? (
                'คลิกปุ่ม "สร้างรายงานกลยุทธ์ชีวิต" เพื่อให้ AI สังเคราะห์พื้นดวงและบทชีวิตปัจจุบันของคุณ'
              ) : (
                <span
                  onClick={onOpenAuth}
                  className="text-amber-600 dark:text-amber-400 font-bold underline cursor-pointer"
                >
                  เข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มต้นใช้งานสิทธิ์ทดลองฟรี
                </span>
              )}
            </p>
          </div>
        )}
      </section>

      {/* Part 2: Interactive Life Planning Chat */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-500" />
            <span>ห้องสนทนาและปรึกษาชีวิต (Cosmic Counselor Q&A)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ถามประเด็นที่คุณกำลังตัดสินใจ AI จะตอบโดยอิงจากตำแหน่งดาวและโครงสร้างธาตุของคุณ
          </p>
        </div>

        {/* Prompt Suggestions */}
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all cursor-pointer text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Log */}
        <div className="min-h-[220px] max-h-[480px] overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800">
          {messages.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              พิมพ์คำถามหรือเลือกประเด็นด้านบนเพื่อเริ่มการสนทนากับ AI Counselor
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-line">{msg.text}</p>
                  ) : (
                    <MarkdownRenderer content={msg.text} />
                  )}
                  <div
                    className={`text-[10px] mt-2 opacity-60 ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp} {msg.source ? `• ${msg.source}` : ''}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}
          {isSendingChat && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>AI กำลังวิเคราะห์ดวงดาวและสังเคราะห์คำตอบ...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={isSendingChat}
            placeholder={
              !user
                ? 'กรุณาเข้าสู่ระบบเพื่อพิมพ์คำถาม...'
                : isSendingChat
                ? 'AI กำลังประมวลผลคำตอบ...'
                : 'พิมพ์คำถามชีวิตที่คุณต้องการคำปรึกษา...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isSendingChat}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <span>ส่งคำถาม</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </section>

      {/* Optional Custom API Key Modal */}
      {showKeyModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowKeyModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              <span>ตั้งค่า Google Gemini API Key ส่วนตัว (ทางเลือก)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              เซิร์ฟเวอร์ Solarian มีระบบประมวลผล AI หลังบ้านพร้อมใช้งาน หากต้องการใช้โควตาของบัญชี Google AI Studio ส่วนตัว สามารถระบุคีย์ที่นี่ได้
            </p>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <div className="flex items-center justify-between gap-2 pt-2">
              {apiKey ? (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('solarian_gemini_key');
                    setApiKey('');
                    setTempKey('');
                    setShowKeyModal(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างคีย์</span>
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm shadow-amber-500/20"
                >
                  บันทึกคีย์
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
