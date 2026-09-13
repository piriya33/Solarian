import React, { useState, useEffect } from 'react';
import type { BirthProfile } from '../types';
import { Calendar, Clock, MapPin, Sparkles, Download, RefreshCw, Compass, Edit3, ChevronUp, UserCheck, PlusCircle, ShieldCheck } from 'lucide-react';

interface BirthInputFormProps {
  onCalculate: (params: any) => void;
  onExportPdf: (params: any) => void;
  isLoading: boolean;
  isExporting: boolean;
  cities: Array<{ city: string; lat: number; lon: number; tz: number }>;
  hasChart?: boolean;
  profiles?: BirthProfile[];
  activeProfileId?: number | null;
  onSelectProfile?: (profile: BirthProfile) => void;
  onSaveNewProfile?: (profileData: any) => void;
  isLoggedIn?: boolean;
}

export const BirthInputForm: React.FC<BirthInputFormProps> = ({
  onCalculate,
  onExportPdf,
  isLoading,
  isExporting,
  cities,
  hasChart = false,
  profiles = [],
  activeProfileId = null,
  onSelectProfile,
  onSaveNewProfile,
  isLoggedIn = false,
}) => {
  const [name, setName] = useState('เจ้าชะตา');
  const [birthDate, setBirthDate] = useState('1985-01-13');
  const [birthTime, setBirthTime] = useState('09:45');
  const [selectedCity, setSelectedCity] = useState('Bangkok, Thailand (กรุงเทพฯ)');
  const [latitude, setLatitude] = useState(13.75);
  const [longitude, setLongitude] = useState(100.5167);
  const [tzOffset, setTzOffset] = useState(7.0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync form when activeProfile changes
  useEffect(() => {
    if (activeProfileId && profiles.length > 0) {
      const active = profiles.find((p) => p.id === activeProfileId);
      if (active) {
        setName(active.name);
        setBirthDate(active.birth_date);
        setBirthTime(active.birth_time);
        setSelectedCity(active.location_name);
        setLatitude(active.latitude);
        setLongitude(active.longitude);
        setTzOffset(active.tz_offset);
      }
    }
  }, [activeProfileId, profiles]);

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const found = cities.find((c) => c.city === cityName);
    if (found) {
      setLatitude(found.lat);
      setLongitude(found.lon);
      setTzOffset(found.tz);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({
      name,
      birth_date: birthDate,
      birth_time: birthTime,
      latitude: Number(latitude),
      longitude: Number(longitude),
      tz_offset: Number(tzOffset),
      location_name: selectedCity,
    });
  };

  const handlePdfClick = () => {
    onExportPdf({
      name,
      birth_date: birthDate,
      birth_time: birthTime,
      latitude: Number(latitude),
      longitude: Number(longitude),
      tz_offset: Number(tzOffset),
      location_name: selectedCity,
    });
  };

  // Compact summary bar when collapsed
  if (hasChart && isCollapsed) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3 transition-all duration-250">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{name}</span>
              <span className="text-xs bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono">
                {birthDate} ({birthTime} น.)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{selectedCity}</span>
              <span>•</span>
              <span className="font-mono">{latitude}°N, {longitude}°E (UTC+{tzOffset})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
            <span>แก้ไขข้อมูลเกิด</span>
          </button>

          <button
            type="button"
            onClick={handlePdfClick}
            disabled={isExporting || isLoading}
            title="ดาวน์โหลดรายงานฉบับเต็ม PDF"
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center cursor-pointer shadow-sm"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
            ) : (
              <Download className="w-4 h-4 text-amber-500" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-250">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 dark:from-amber-200 dark:via-amber-400 dark:to-amber-100 bg-clip-text text-transparent">
              ผูกดวงชะตากำเนิด (Natal Chart Setup)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            คำนวณตำแหน่งดาวและเรือนชะตา Placidus สากล, มหาทักษา 108 ปี และปาจื่อ ด้วยความแม่นยำ JPL DE431
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChart && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>ย่อแบบฟอร์ม</span>
            </button>
          )}
        </div>
      </div>

      {/* Saved Profiles Quick Bar (Multi-Profile Selector) */}
      {isLoggedIn && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/40 mb-5">
          {profiles.length > 0 ? (
            <div className="flex items-center gap-2 max-w-full">
              <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 shrink-0">ดวงชะตาในบัญชี:</span>
              <select
                value={activeProfileId || ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const found = profiles.find((p) => p.id === id);
                  if (found && onSelectProfile) {
                    onSelectProfile(found);
                  }
                }}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 text-slate-800 dark:text-slate-200 cursor-pointer max-w-[200px] sm:max-w-xs truncate"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.birth_date}) {p.is_default ? '★ หลัก' : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300">
              <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>ยังไม่มีดวงชะตาที่บันทึกไว้ในบัญชีของคุณ</span>
            </div>
          )}

          {onSaveNewProfile && (
            <button
              type="button"
              onClick={() => {
                onSaveNewProfile({
                  name,
                  birth_date: birthDate,
                  birth_time: birthTime,
                  latitude,
                  longitude,
                  tz_offset: tzOffset,
                  location_name: selectedCity,
                });
              }}
              title="บันทึกข้อมูลดวงนี้ลงในฐานข้อมูลส่วนตัว เข้ารหัส AES-256 ปลอดภัย"
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-amber-600 dark:text-amber-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>บันทึกเป็นดวงใหม่ในบัญชี</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-0.5 border border-emerald-500/20">
                <ShieldCheck className="w-2.5 h-2.5" />
                AES-256
              </span>
            </button>
          )}
        </div>
      )}

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            ชื่อเจ้าชะตา (Name)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors"
            placeholder="ชื่อเจ้าชะตา"
            required
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            วันเดือนปีเกิด (ค.ศ.)
          </label>
          <div className="relative">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors pr-9"
              required
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Time of Birth */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            เวลาเกิด (hh:mm)
          </label>
          <div className="relative">
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors pr-9"
              required
            />
            <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Location Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            สถานที่เกิด (Preset Cities)
          </label>
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors appearance-none pr-9 cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c.city} value={c.city} className="bg-white dark:bg-slate-900">
                  {c.city}
                </option>
              ))}
            </select>
            <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Coordinates Details Row */}
        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">ละติจูด (Lat)</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-amber-500 text-xs py-1 text-slate-800 dark:text-slate-200 outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">ลองจิจูด (Lon)</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-amber-500 text-xs py-1 text-slate-800 dark:text-slate-200 outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">โซนเวลา (UTC+)</label>
            <input
              type="number"
              step="any"
              value={tzOffset}
              onChange={(e) => setTzOffset(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-amber-500 text-xs py-1 text-slate-800 dark:text-slate-200 outline-none font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 lg:col-span-1 flex items-end gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังคำนวณ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>คำนวณดวงชะตา</span>
              </>
            )}
          </button>

          {hasChart && (
            <button
              type="button"
              onClick={handlePdfClick}
              disabled={isExporting || isLoading}
              title="ส่งออกเอกสารรายงานฉบับสมบูรณ์ (PDF 5 หน้า)"
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              ) : (
                <Download className="w-4 h-4 text-amber-500" />
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
