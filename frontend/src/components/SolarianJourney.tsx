import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Compass,
  Download,
  FileClock,
  LogIn,
  LogOut,
  MapPin,
  RotateCcw,
  Save,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import type { ApiResponse, AspectData, BirthProfile, GuidancePeriodKey, MajorPeriod, PracticalGuidance, SynastryResult, User, YearEntry } from "../types";
import { AspectGrid } from "./AspectGrid";
import { BaziCard } from "./BaziCard";
import { NatalWheel } from "./NatalWheel";
import { PlanetTable } from "./PlanetTable";
import { SimpleReadingView } from "./SimpleReadingView";
import { AICounselorView } from "./AICounselorView";
import { AIPaywallModal } from "./AIPaywallModal";

type City = { city: string; lat: number; lon: number; tz: number };
type Page = "reading" | "pro" | "bazi" | "connections" | "ai";
type Focus = "career" | "money" | "investment";

const guidanceTabLabels: Record<GuidancePeriodKey, string> = {
  today: "วันนี้",
  year: "ปีนี้",
  period: "ช่วงนี้",
  identity: "ตัวตน",
};

type BirthParams = {
  name: string;
  birth_date: string;
  birth_time: string;
  latitude: number;
  longitude: number;
  tz_offset: number;
  location_name: string;
};

type AccountUser = User & {
  profile?: Partial<BirthParams> | null;
};

function bangkokTodayISO() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return ["year", "month", "day"]
    .map((key) => parts.find((part) => part.type === key)?.value ?? "")
    .join("-");
}

function calculateFullAge(birthDate: string, referenceDate = bangkokTodayISO()) {
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const [year, month, day] = referenceDate.split("-").map(Number);
  let age = year - birthYear;
  if (month < birthMonth || (month === birthMonth && day < birthDay)) age -= 1;
  return Math.max(0, Math.min(108, age));
}

function formatThaiDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function otherAspectBody(aspect: AspectData) {
  return aspect.body1 === "Sun"
    ? { name: aspect.body2, thai: aspect.body2_thai, symbol: aspect.body2_symbol }
    : { name: aspect.body1, thai: aspect.body1_thai, symbol: aspect.body1_symbol };
}

function bodyLabel(body: ReturnType<typeof otherAspectBody>) {
  const label = body.thai || body.name;
  return body.name === "Ascendant" || body.name === "Midheaven" || label === "ลัคนา" || label === "MC"
    ? label
    : `ดาว${label}`;
}

function cleanInterpretation(value?: string) {
  return (value ?? "").replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function formatExactTriggerAge(exactAge: number) {
  const wholeYears = Math.floor(exactAge);
  let months = Math.round((exactAge - wholeYears) * 12);
  const years = months === 12 ? wholeYears + 1 : wholeYears;
  if (months === 12) months = 0;
  return `${exactAge.toFixed(2)} ปี · ประมาณ ${years} ปี${months ? ` ${months} เดือน` : ""}`;
}

const planetArtIndex: Record<string, number> = {
  Sun: 0,
  Moon: 1,
  Mars: 2,
  Mercury: 3,
  Jupiter: 4,
  Venus: 5,
  Saturn: 6,
  "True Node": 7,
  Rahu: 7,
};

type DeityLegend = {
  thai: string;
  symbol: string;
  origin: string;
  power: number;
  dayColor: string;
  dayColorHex: string;
  clothColor: string;
  reflection: string;
};

const planetDeityLegends: Record<string, DeityLegend> = {
  Sun: { thai: "อาทิตย์", symbol: "☉", origin: "ราชสีห์ 6 ตัว", power: 6, dayColor: "แดง", dayColorHex: "#a94538", clothColor: "แดง", reflection: "กล้าตัดสินใจโดยไม่ใช้อำนาจครอบงำ" },
  Moon: { thai: "จันทร์", symbol: "☽", origin: "นางฟ้า 15 นาง", power: 15, dayColor: "เหลือง", dayColorHex: "#c99b2f", clothColor: "ขาวนวล", reflection: "ดูแลผู้อื่นพร้อมรักษาขอบเขตของตน" },
  Mars: { thai: "อังคาร", symbol: "♂", origin: "กระบือ 8 ตัว", power: 8, dayColor: "ชมพู", dayColorHex: "#c9637b", clothColor: "ชมพูแดง", reflection: "ใช้พลังลงมือด้วยความยับยั้งชั่งใจ" },
  Mercury: { thai: "พุธ", symbol: "☿", origin: "ช้าง 17 เชือก", power: 17, dayColor: "เขียว", dayColorHex: "#537255", clothColor: "เขียวใบไม้", reflection: "ฟังก่อนพูดและตรวจความหมายให้ตรงกัน" },
  Jupiter: { thai: "พฤหัสบดี", symbol: "♃", origin: "พระฤาษี 19 องค์", power: 19, dayColor: "ส้ม", dayColorHex: "#bc7131", clothColor: "แสด/เหลือง", reflection: "ใช้ปัญญาคู่กับความถ่อมตน" },
  Venus: { thai: "ศุกร์", symbol: "♀", origin: "โคอุสุภราชสีขาว 21 ตัว", power: 21, dayColor: "ฟ้า", dayColorHex: "#5e8fa4", clothColor: "ฟ้า/คราม", reflection: "มองคุณค่าที่ลึกกว่าความเพลิดเพลิน" },
  Saturn: { thai: "เสาร์", symbol: "♄", origin: "เสือ 10 ตัว", power: 10, dayColor: "ม่วง", dayColorHex: "#705d83", clothColor: "ดำคล้ำ", reflection: "อดทนและปรับตัวเมื่อเงื่อนไขเปลี่ยน" },
  "True Node": { thai: "ราหู", symbol: "☊", origin: "หัวผีโขมด 12 หัว", power: 12, dayColor: "ดำ", dayColorHex: "#111111", clothColor: "ทองสำริด/หมอกมัว", reflection: "สังเกตความอยากและตรวจข้อเท็จจริงก่อนเชื่อ" },
  Rahu: { thai: "ราหู", symbol: "☊", origin: "หัวผีโขมด 12 หัว", power: 12, dayColor: "ดำ", dayColorHex: "#111111", clothColor: "ทองสำริด/หมอกมัว", reflection: "สังเกตความอยากและตรวจข้อเท็จจริงก่อนเชื่อ" },
};

const deityLegendOrder = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"] as const;

const zodiacArtIndex: Record<string, number> = {
  Aries: 0,
  Taurus: 1,
  Gemini: 2,
  Cancer: 3,
  Leo: 4,
  Virgo: 5,
  Libra: 6,
  Scorpio: 7,
  Sagittarius: 8,
  Capricorn: 9,
  Aquarius: 10,
  Pisces: 11,
};

function ArtTile({ atlas, index, className }: { atlas: "planet" | "zodiac"; index?: number; className: string }) {
  if (index === undefined) return null;
  const columns = 4;
  const rows = atlas === "planet" ? 2 : 3;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const planetRowHeight = row === 0 ? 490 : 397;
  const backgroundHeight = atlas === "planet" ? (887 / planetRowHeight) * 100 : rows * 100;
  return <span
    className={className}
    aria-hidden="true"
    style={{
      backgroundImage: `url(/assets/${atlas === "planet" ? "planet-devas-thai-v2.png" : "zodiac-paintings-v1.png"})`,
      backgroundSize: `${columns * 100}% ${backgroundHeight}%`,
      backgroundPosition: `${(column / (columns - 1)) * 100}% ${(row / (rows - 1)) * 100}%`,
      aspectRatio: atlas === "planet" ? `${1774 / 4} / ${planetRowHeight}` : "1 / 1",
    }}
  />;
}

function readRoute(): { page: Page; age: number | null; focus: Focus } {
  const query = new URLSearchParams(window.location.search);
  const view = query.get("view");
  const ageValue = query.get("age");
  const focusValue = query.get("focus");
  const age = ageValue !== null && /^\d{1,3}$/.test(ageValue) && Number(ageValue) <= 108
    ? Number(ageValue)
    : null;

  let page: Page = "reading";
  if (view === "pro" || view === "advanced") page = "pro";
  else if (view === "bazi") page = "bazi";
  else if (view === "connections") page = "connections";
  else if (view === "ai") page = "ai";
  else page = "reading";

  return {
    page,
    age,
    focus: (["career", "money", "investment"] as Focus[]).includes(focusValue as Focus) ? focusValue as Focus : "career" as Focus,
  };
}

function writeRoute(route: { page: Page; age: number; focus: Focus }, mode: "push" | "replace" = "replace") {
  const url = new URL(window.location.href);
  if (route.page === "reading") url.searchParams.delete("view");
  else url.searchParams.set("view", route.page);
  url.searchParams.set("age", String(route.age));
  if (route.focus === "career") url.searchParams.delete("focus");
  else url.searchParams.set("focus", route.focus);
  window.history[mode === "push" ? "pushState" : "replaceState"]({}, "", url);
}

function extractError(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "detail" in payload) {
    return String((payload as { detail?: unknown }).detail || fallback);
  }
  return fallback;
}

function AccountDialog({
  open,
  onClose,
  onSuccess,
  currentChart,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: AccountUser, token: string, savedCurrentOnRegister: boolean) => void;
  currentChart: BirthParams | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saveChart, setSaveChart] = useState(Boolean(currentChart));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => setSaveChart(Boolean(currentChart)), [currentChart]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body: Record<string, unknown> = { email: email.trim(), password };
      if (mode === "register" && saveChart && currentChart) {
        body.profile = { ...currentChart, relationship: "self" };
      }
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(extractError(payload, "ไม่สามารถยืนยันบัญชีได้"));
      localStorage.setItem("solarian_token", payload.access_token);
      onSuccess(payload.user, payload.access_token, mode === "register" && saveChart && Boolean(currentChart));
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "การเชื่อมต่อล้มเหลว กรุณาลองใหม่");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      className="sj-dialog"
      aria-labelledby="account-title"
      onCancel={onClose}
      onClose={() => open && onClose()}
    >
      <button className="sj-icon-button sj-dialog-close" type="button" onClick={onClose} aria-label="ปิดหน้าบัญชี">
        <X aria-hidden="true" />
      </button>
      <p className="sj-kicker">บัญชีและโปรไฟล์</p>
      <h2 id="account-title">{mode === "login" ? "กลับมาอ่านแผนเดิม" : "สร้างพื้นที่ส่วนตัว"}</h2>
      <p className="sj-muted">บัญชีใช้สำหรับบันทึกและจัดการโปรไฟล์ดวงชะตาของคุณอย่างปลอดภัยบนระบบ</p>
      <div className="sj-segment" role="group" aria-label="เลือกรูปแบบบัญชี">
        <button type="button" aria-pressed={mode === "login"} onClick={() => { setMode("login"); setError(""); }}>เข้าสู่ระบบ</button>
        <button type="button" aria-pressed={mode === "register"} onClick={() => { setMode("register"); setError(""); }}>สร้างบัญชี</button>
      </div>
      {error && <p className="sj-alert" role="alert"><CircleAlert aria-hidden="true" />{error}</p>}
      <form onSubmit={submit} className="sj-form-stack">
        <label>อีเมล<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>รหัสผ่าน<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {mode === "register" && currentChart && (
          <label className="sj-check"><input type="checkbox" checked={saveChart} onChange={(e) => setSaveChart(e.target.checked)} />บันทึกโปรไฟล์ “{currentChart.name}” พร้อมบัญชีนี้</label>
        )}
        <button className="sj-button sj-primary" disabled={busy}>{busy ? "กำลังเชื่อมต่อ…" : mode === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}</button>
      </form>
    </dialog>
  );
}

function BirthSetup({
  cities,
  citiesError,
  initial,
  loading,
  onCalculate,
}: {
  cities: City[];
  citiesError: string;
  initial: BirthParams | null;
  loading: boolean;
  onCalculate: (params: BirthParams) => void;
}) {
  const [locationName, setLocationName] = useState(initial?.location_name ?? "");
  const [customLocation, setCustomLocation] = useState(Boolean(initial?.location_name));
  const [latitude, setLatitude] = useState<number | "">(initial?.latitude ?? "");
  const [longitude, setLongitude] = useState<number | "">(initial?.longitude ?? "");
  const [timezone, setTimezone] = useState<number | "">(initial?.tz_offset ?? "");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!initial) return;
    setLocationName(initial.location_name);
    setCustomLocation(!cities.some((item) => item.city === initial.location_name));
    setLatitude(initial.latitude);
    setLongitude(initial.longitude);
    setTimezone(initial.tz_offset);
  }, [cities, initial]);

  function chooseCity(cityName: string) {
    if (cityName === "__custom__") {
      setCustomLocation(true);
      setLocationName("");
      setLatitude("");
      setLongitude("");
      setTimezone("");
      return;
    }
    setCustomLocation(false);
    setLocationName(cityName);
    const city = cities.find((item) => item.city === cityName);
    if (city) {
      setLatitude(city.lat);
      setLongitude(city.lon);
      setTimezone(city.tz);
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const submittedName = String(formData.get("name") ?? "").trim();
    const submittedDate = String(formData.get("birth_date") ?? "");
    const submittedTime = String(formData.get("birth_time") ?? "");
    const cityChoice = String(formData.get("city_choice") ?? "");
    const submittedLocation = cityChoice === "__custom__"
      ? String(formData.get("custom_location") ?? "").trim()
      : cityChoice;
    const latitudeRaw = String(formData.get("latitude") ?? "");
    const longitudeRaw = String(formData.get("longitude") ?? "");
    const timezoneRaw = String(formData.get("tz_offset") ?? "");
    const submittedLatitude = Number(latitudeRaw);
    const submittedLongitude = Number(longitudeRaw);
    const submittedTimezone = Number(timezoneRaw);
    if (!submittedName || !submittedDate || !submittedTime || !submittedLocation || !latitudeRaw || !longitudeRaw || !timezoneRaw || !Number.isFinite(submittedLatitude) || !Number.isFinite(submittedLongitude) || !Number.isFinite(submittedTimezone)) {
      setFormError("ข้อมูลเกิดยังไม่ครบ กรุณาตรวจชื่อ วัน เวลา เมือง พิกัด และ UTC offset");
      form.reportValidity();
      return;
    }
    setFormError("");
    onCalculate({
      name: submittedName,
      birth_date: submittedDate,
      birth_time: submittedTime,
      latitude: submittedLatitude,
      longitude: submittedLongitude,
      tz_offset: submittedTimezone,
      location_name: submittedLocation,
    });
  }

  return (
    <section className="sj-setup sj-raised" aria-labelledby="setup-title">
      <div className="sj-section-heading">
        <div><p className="sj-kicker">เริ่มจากข้อมูลที่ตรวจได้</p><h2 id="setup-title">สร้างแผนที่ของคุณ</h2></div>
        <span className="sj-step-chip">ข้อมูลบุคคล</span>
      </div>
      <form className="sj-birth-grid" onSubmit={submit}>
        <label>ชื่อที่ใช้ในแผน<input key={`name-${initial?.name ?? "new"}`} name="name" defaultValue={initial?.name ?? ""} autoComplete="name" placeholder="ชื่อหรือชื่อเล่น" required /></label>
        <label>วันเดือนปีเกิด (ค.ศ.)<input key={`date-${initial?.birth_date ?? "new"}`} name="birth_date" type="date" defaultValue={initial?.birth_date ?? ""} max={bangkokTodayISO()} required /></label>
        <label>เวลาเกิด<input key={`time-${initial?.birth_time ?? "new"}`} name="birth_time" type="time" defaultValue={initial?.birth_time ?? ""} required /><small>หากไม่ทราบเวลา ระบบปัจจุบันยังไม่รองรับการคำนวณเรือนและลัคนาอย่างน่าเชื่อถือ</small></label>
        <label>เมืองที่เกิด<select name="city_choice" value={customLocation ? "__custom__" : locationName} onChange={(e) => chooseCity(e.target.value)} required>
          <option value="">{cities.length ? "เลือกเมือง" : "เลือกระบุสถานที่เอง"}</option>
          {cities.map((city) => <option key={city.city} value={city.city}>{city.city}</option>)}
          <option value="__custom__">ระบุสถานที่เอง</option>
        </select></label>
        {customLocation && <label className="sj-grid-wide">ชื่อเมืองและประเทศ<input name="custom_location" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="เช่น Berlin, Germany" required /></label>}
        <details className="sj-coordinate-details" open={customLocation || undefined}>
          <summary>ตรวจพิกัดและเขตเวลา</summary>
          <div className="sj-coordinate-grid">
            <label>ละติจูด<input name="latitude" type="number" step="any" min="-90" max="90" value={latitude} onChange={(e) => setLatitude(e.target.value === "" ? "" : Number(e.target.value))} required /></label>
            <label>ลองจิจูด<input name="longitude" type="number" step="any" min="-180" max="180" value={longitude} onChange={(e) => setLongitude(e.target.value === "" ? "" : Number(e.target.value))} required /></label>
            <label>UTC offset<input name="tz_offset" type="number" step="0.25" min="-14" max="14" value={timezone} onChange={(e) => setTimezone(e.target.value === "" ? "" : Number(e.target.value))} required /></label>
          </div>
          <p className="sj-field-note">ค่าจากรายชื่อเมืองเป็นค่าอ้างอิงทั่วไปและไม่ปรับ daylight saving ตามวันที่ในอดีตอัตโนมัติ กรุณาตรวจ UTC offset ของวันเกิดก่อนคำนวณ</p>
        </details>
        {citiesError && <p className="sj-alert sj-grid-wide" role="alert"><CircleAlert aria-hidden="true" />{citiesError}</p>}
        {formError && <p className="sj-alert sj-grid-wide" role="alert"><CircleAlert aria-hidden="true" />{formError}</p>}
        <button className="sj-button sj-primary sj-submit" disabled={loading}>
          {loading ? <><RotateCcw className="sj-spin" aria-hidden="true" />กำลังคำนวณ</> : <><Sparkles aria-hidden="true" />คำนวณดวงชะตา</>}
        </button>
      </form>
    </section>
  );
}

function PeriodOverview({ periods, selectedAge, onSelect }: { periods: MajorPeriod[]; selectedAge: number; onSelect: (age: number) => void }) {
  return (
    <div className="sj-period-overview" aria-label="ภาพรวมช่วงดาวเสวยอายุ 108 ปี">
      {periods.map((period, index) => {
        const active = period.start_age <= selectedAge && (selectedAge < period.end_age || (selectedAge === 108 && period.end_age === 108));
        return (
          <button
            key={period.period_index}
            className={`sj-period sj-period-${index % 8}`}
            style={{ flexGrow: period.duration_years }}
            aria-pressed={active}
            aria-label={`ดาว${period.planet_thai} ช่วงอายุ ${period.start_age} ถึง ${period.end_age} ปี`}
            onClick={() => onSelect(Math.max(0, Math.min(108, Math.floor(period.start_age))))}
            title={`ดาว${period.planet_thai} อายุ ${period.start_age}–${period.end_age} ปี`}
          >
            <span>{period.planet_symbol}</span><small>{period.planet_thai}</small>
          </button>
        );
      })}
    </div>
  );
}

function GuidanceDashboard({ guidance, activeTab, onTabChange }: { guidance?: PracticalGuidance; activeTab: GuidancePeriodKey; onTabChange: (tab: GuidancePeriodKey) => void }) {
  const card = guidance?.periods?.[activeTab];
  const tabs = Object.keys(guidanceTabLabels) as GuidancePeriodKey[];
  const scopeLabel = card
    ? activeTab === "today"
      ? card.date_label || formatThaiDate(guidance?.reference_date ?? "")
      : activeTab === "period"
        ? card.start_date && card.end_date ? `${formatThaiDate(card.start_date)} – ${formatThaiDate(card.end_date)}` : "ช่วงที่กำลังอยู่"
        : activeTab === "year"
          ? card.date_label || [card.age != null ? `อายุ ${card.age} ปี` : "", card.calendar_year ? `ค.ศ. ${card.calendar_year}` : ""].filter(Boolean).join(" · ")
          : "อ่านจากข้อมูลดวงกำเนิด"
    : "";

  function moveTab(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    const next = tabs[nextIndex];
    onTabChange(next);
    document.getElementById(`guidance-tab-${next}`)?.focus();
  }

  return (
    <section className="sj-guidance sj-raised" aria-labelledby="guidance-title">
      <div className="sj-guidance-heading">
        <div><p className="sj-kicker">เริ่มจากสิ่งที่นำไปใช้ได้</p><h2 id="guidance-title">คำแนะนำสำหรับจังหวะของคุณ</h2></div>
        {guidance?.reference_date && <span className="sj-source">อ้างอิง {formatThaiDate(guidance.reference_date)}</span>}
      </div>
      <div className="sj-guidance-tabs" role="tablist" aria-label="เลือกช่วงเวลาของคำแนะนำ">
        {tabs.map((tab, index) => <button
          id={`guidance-tab-${tab}`}
          key={tab}
          type="button"
          role="tab"
          aria-selected={activeTab === tab}
          aria-controls="guidance-panel"
          tabIndex={activeTab === tab ? 0 : -1}
          onClick={() => onTabChange(tab)}
          onKeyDown={(event) => moveTab(event, index)}
        >{guidanceTabLabels[tab]}</button>)}
      </div>

      <div id="guidance-panel" className="sj-guidance-panel" role="tabpanel" tabIndex={0} aria-labelledby={`guidance-tab-${activeTab}`}>
        {card ? <>
          <div className="sj-guidance-summary">
            <span>{scopeLabel}</span>
            <h3>{cleanInterpretation(card.title)}</h3>
            <p>{cleanInterpretation(card.summary)}</p>
          </div>
          <div className="sj-guidance-actions">
            <article className="sj-guidance-do"><h4>ควรทำ</h4><ul>{card.do.slice(0, 3).map((item, index) => <li key={`do-${index}`}>{cleanInterpretation(item)}</li>)}</ul></article>
            <article className="sj-guidance-avoid"><h4>ควรเลี่ยง</h4><ul>{card.avoid.slice(0, 3).map((item, index) => <li key={`avoid-${index}`}>{cleanInterpretation(item)}</li>)}</ul></article>
          </div>
          <details className="sj-guidance-sources">
            <summary>ดูที่มาของคำแนะนำ <ChevronDown aria-hidden="true" /></summary>
            <p>คำแนะนำนี้เรียบเรียงจากความสัมพันธ์ของดวงอาทิตย์ เรือนและดาวเจ้าเรือน รวมกับช่วงเวลาที่ระบุ โดยใช้เป็นกรอบทบทวน</p>
            <ul>{card.sources.map((source, index) => <li key={`${source.kind}-${index}`}>{cleanInterpretation(source.label)}</li>)}</ul>
          </details>
        </> : <div className="sj-guidance-unavailable" role="status"><CircleAlert aria-hidden="true" /><div><h3>คำแนะนำแบบย่อยังไม่พร้อม</h3><p>ผลคำนวณชุดนี้ยังไม่มีสรุป 4 ช่วงเวลา คุณยังเปิดแผน 108 ปีและข้อมูลดวงด้านล่างได้</p></div></div>}
      </div>
    </section>
  );
}

function ConnectionsPage({
  person1Params,
  profiles,
  cities,
}: {
  person1Params: BirthParams | null;
  profiles: BirthProfile[];
  cities: City[];
}) {
  const [partnerName, setPartnerName] = useState("คู่ครอง/หุ้นส่วน");
  const [partnerDate, setPartnerDate] = useState("1988-08-20");
  const [partnerTime, setPartnerTime] = useState("12:00");
  const [selectedCityIdx, setSelectedCityIdx] = useState(0);
  const [synastryResult, setSynastryResult] = useState<SynastryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<"all" | "harmonious" | "challenging">("all");

  const runSynastry = async (p2Data?: BirthParams) => {
    if (!person1Params) {
      setError("กรุณากรอกและคำนวณดวงชะตาแรกในหน้า 'ดวงชะตา' ก่อนเปรียบเทียบ");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const city = cities[selectedCityIdx] || { city: "Bangkok, Thailand", lat: 13.75, lon: 100.5167, tz: 7.0 };
      const person2Payload = p2Data || {
        name: partnerName.trim() || "บุคคลที่ 2",
        birth_date: partnerDate,
        birth_time: partnerTime,
        latitude: city.lat,
        longitude: city.lon,
        tz_offset: city.tz,
        location_name: city.city,
      };

      const res = await fetch("/api/chart/synastry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person1: person1Params,
          person2: person2Payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "คำนวณดวงสัมพันธ์ไม่สำเร็จ");
      setSynastryResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการคำนวณ");
    } finally {
      setLoading(false);
    }
  };

  const filteredAspects = useMemo(() => {
    if (!synastryResult?.cross_aspects) return [];
    if (filterType === "harmonious") return synastryResult.cross_aspects.filter(a => a.is_harmonious);
    if (filterType === "challenging") return synastryResult.cross_aspects.filter(a => a.is_challenging);
    return synastryResult.cross_aspects;
  }, [synastryResult, filterType]);

  return (
    <main className="sj-page sj-narrow" id="main" tabIndex={-1}>
      <p className="sj-kicker">ความสัมพันธ์และพันธมิตรชีวิต</p>
      <h1>วิเคราะห์ดวงสัมพันธ์ (Synastry & Bazi Dynamics)</h1>
      <p className="sj-lead">
        เปรียบเทียบมิติพลังงานคู่ครอง หุ้นส่วน หรือผู้ร่วมงาน ผสานโหราศาสตร์สากลพลาซิดัส (Cross Aspects) เข้ากับพลังงานห้าธาตุปาจื่อ เพื่อสร้างความเข้าใจร่วมและบริหารความสัมพันธ์อย่างสร้างสรรค์
      </p>

      {!person1Params ? (
        <div className="sj-guidance-unavailable" role="status">
          <CircleAlert aria-hidden="true" />
          <div>
            <h3>ยังไม่มีข้อมูลดวงชะตาหลัก</h3>
            <p>กรุณากลับไปที่หน้า “ดวงชะตา” เพื่อคำนวณดวงของท่านก่อนเปิดการเปรียบเทียบความสัมพันธ์</p>
          </div>
        </div>
      ) : (
        <div className="sj-results">
          {/* Partner Setup Form */}
          <section className="sj-setup sj-raised">
            <div className="sj-section-heading">
              <div>
                <p className="sj-kicker">เปรียบเทียบกับ</p>
                <h2>ข้อมูลผู้ร่วมทาง / คู่ครอง (คนที่ 2)</h2>
              </div>
              {profiles.length > 0 && (
                <label style={{ minWidth: "160px" }}>
                  <span>เลือกจากโปรไฟล์</span>
                  <select onChange={(e) => {
                    const prof = profiles.find(p => p.id === Number(e.target.value));
                    if (prof) {
                      setPartnerName(prof.name);
                      setPartnerDate(prof.birth_date);
                      setPartnerTime(prof.birth_time);
                      const cityIdx = cities.findIndex(c => c.city === prof.location_name);
                      if (cityIdx !== -1) setSelectedCityIdx(cityIdx);
                    }
                  }}>
                    <option value="">-- เลือกโปรไฟล์ --</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>)}
                  </select>
                </label>
              )}
            </div>

            <div className="sj-birth-grid">
              <label>
                <span>ชื่อหรือบทบาท</span>
                <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="ชื่อคู่ครอง / หุ้นส่วน" required />
              </label>

              <label>
                <span>สถานที่เกิด (เมือง)</span>
                <select value={selectedCityIdx} onChange={(e) => setSelectedCityIdx(Number(e.target.value))}>
                  {cities.map((c, idx) => <option key={c.city} value={idx}>{c.city}</option>)}
                </select>
              </label>

              <label>
                <span>วันเดือนปีเกิด (ค.ศ.)</span>
                <input type="date" value={partnerDate} onChange={(e) => setPartnerDate(e.target.value)} required />
              </label>

              <label>
                <span>เวลาเกิด (น.)</span>
                <input type="time" value={partnerTime} onChange={(e) => setPartnerTime(e.target.value)} required />
              </label>

              <div className="sj-grid-wide" style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <button className="sj-button sj-primary" onClick={() => runSynastry()} disabled={loading}>
                  {loading ? <Sparkles className="sj-spin" /> : <Sparkles />}
                  {loading ? "กำลังวิเคราะห์..." : "วิเคราะห์ความสัมพันธ์"}
                </button>
              </div>
            </div>
            {error && <p className="sj-alert" style={{ marginTop: "16px" }}>{error}</p>}
          </section>

          {/* Results Section */}
          {synastryResult && (
            <div className="sj-results animate-fade-in" style={{ marginTop: "24px" }}>
              {/* Top Comparison Header */}
              <section className="sj-profile-bar sj-raised">
                <div>
                  <p className="sj-kicker">พิมพ์เขียวพลังงานสองฝ่าย</p>
                  <h2>{synastryResult.person1.name} ✕ {synastryResult.person2.name}</h2>
                  <div className="sj-synastry-profiles-summary">
                    <p>
                      <strong>{synastryResult.person1.name}:</strong> อาทิตย์{synastryResult.person1.sun} · จันทร์{synastryResult.person1.moon} · ลัคนา{synastryResult.person1.ascendant}
                    </p>
                    <p>
                      <strong>{synastryResult.person2.name}:</strong> อาทิตย์{synastryResult.person2.sun} · จันทร์{synastryResult.person2.moon} · ลัคนา{synastryResult.person2.ascendant}
                    </p>
                  </div>
                </div>
              </section>

              {/* Eastern Bazi Element Synergy */}
              <section className="sj-guidance sj-raised">
                <div className="sj-guidance-heading">
                  <div>
                    <p className="sj-kicker">มิติธาตุปาจื่อ (Eastern Five Elements Synergy)</p>
                    <h2>ความกลมกลืนแห่งธาตุเจ้าชะตา (Day Master)</h2>
                  </div>
                  <span className="sj-status">{synastryResult.bazi_synergy.synergy_type}</span>
                </div>

                <div className="sj-guidance-summary">
                  <p style={{ fontSize: "1.1rem", lineHeight: "1.8" }}>
                    {synastryResult.bazi_synergy.synergy_desc}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
                    <div className="sj-raised" style={{ padding: "12px 18px", flex: "1 1 220px", background: "var(--sj-surface)" }}>
                      <small style={{ color: "var(--sj-muted)" }}>{synastryResult.person1.name}</small>
                      <h4 style={{ margin: "4px 0 0" }}>ธาตุเจ้าชะตา: {synastryResult.bazi_synergy.p1_element}</h4>
                    </div>
                    <div className="sj-raised" style={{ padding: "12px 18px", flex: "1 1 220px", background: "var(--sj-surface)" }}>
                      <small style={{ color: "var(--sj-muted)" }}>{synastryResult.person2.name}</small>
                      <h4 style={{ margin: "4px 0 0" }}>ธาตุเจ้าชะตา: {synastryResult.bazi_synergy.p2_element}</h4>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cross Aspects Toolbar & List */}
              <section className="sj-selected-year sj-raised">
                <div className="sj-section-heading">
                  <div>
                    <p className="sj-kicker">พลวัตดาวสัมพันธ์ (Cross Planetary Aspects)</p>
                    <h2>มุมสัมพันธ์ข้ามดวงชะตา ({synastryResult.cross_aspects.length} จุดสัมพันธ์)</h2>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className={`sj-button ${filterType === "all" ? "sj-primary" : "sj-soft"}`} onClick={() => setFilterType("all")}>ทั้งหมด</button>
                    <button className={`sj-button ${filterType === "harmonious" ? "sj-primary" : "sj-soft"}`} onClick={() => setFilterType("harmonious")}>เกื้อหนุน</button>
                    <button className={`sj-button ${filterType === "challenging" ? "sj-primary" : "sj-soft"}`} onClick={() => setFilterType("challenging")}>ท้าทาย</button>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {filteredAspects.slice(0, 15).map((asp, idx) => (
                    <article key={idx} className="sj-raised" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 260px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "1.2rem", color: asp.color }}>{asp.aspect_symbol}</span>
                          <strong>{asp.p1_symbol} ดาว{asp.p1_thai} ({synastryResult.person1.name}) {asp.aspect_thai} {asp.p2_symbol} ดาว{asp.p2_thai} ({synastryResult.person2.name})</strong>
                        </div>
                        <small style={{ color: "var(--sj-muted)" }}>{asp.summary} · สถิต{asp.p1_sign} ↔ {asp.p2_sign}</small>
                      </div>
                      <div style={{ textAlign: "right", marginLeft: "auto" }}>
                        <span className="sj-status" style={{ background: asp.is_harmonious ? "var(--sj-jade-wash)" : asp.is_challenging ? "var(--sj-coral-wash)" : "var(--sj-canvas)" }}>
                          orb {asp.orb.toFixed(2)}°
                        </span>
                      </div>
                    </article>
                  ))}
                  {filteredAspects.length > 15 && (
                    <p style={{ textAlign: "center", color: "var(--sj-muted)", marginTop: "8px" }}>
                      แสดง 15 มุมสัมพันธ์ที่มีระยะ Orb แคบที่สุดจากทั้งหมด {filteredAspects.length} มุม
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export function SolarianJourney() {
  const initialRoute = useMemo(readRoute, []);
  const [page, setPage] = useState<Page>(initialRoute.page);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesError, setCitiesError] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [currentParams, setCurrentParams] = useState<BirthParams | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [selectedAge, setSelectedAge] = useState(initialRoute.age ?? 0);
  const [focus, setFocus] = useState<Focus>(initialRoute.focus);
  const [currentUser, setCurrentUser] = useState<AccountUser | null>(null);
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [triggerFilter, setTriggerFilter] = useState("all");
  const [guidanceTab, setGuidanceTab] = useState<GuidancePeriodKey>("today");
  const requestRef = useRef<{ id: number; controller: AbortController } | null>(null);
  const profileSaveRef = useRef<AbortController | null>(null);
  const pendingProfileRef = useRef<BirthParams | null>(null);
  const currentParamsRef = useRef<BirthParams | null>(null);
  const authGenerationRef = useRef(0);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => { currentParamsRef.current = currentParams; }, [currentParams]);

  useEffect(() => {
    function restoreRoute() {
      const route = readRoute();
      setPage(route.page);
      setFocus(route.focus);
      setSelectedAge(route.age ?? (currentParamsRef.current ? calculateFullAge(currentParamsRef.current.birth_date) : 0));
    }
    window.addEventListener("popstate", restoreRoute);
    return () => window.removeEventListener("popstate", restoreRoute);
  }, []);

  const calculate = useCallback(async (params: BirthParams, profileId?: number, restoreRoute = false) => {
    requestRef.current?.controller.abort();
    profileSaveRef.current?.abort();
    profileSaveRef.current = null;
    setSavingProfile(false);
    const request = { id: (requestRef.current?.id ?? 0) + 1, controller: new AbortController() };
    requestRef.current = request;
    setLoading(true);
    setError("");
    setStatus("");
    setData(null);
    setCurrentParams(params);
    setActiveProfileId(profileId ?? null);
    setSelectedPlanet(null);
    setTriggerFilter("all");
    setGuidanceTab("today");
    try {
      const response = await fetch("/api/chart/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, reference_date: bangkokTodayISO() }),
        signal: request.controller.signal,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(extractError(payload, "คำนวณไม่สำเร็จ กรุณาตรวจข้อมูลแล้วลองใหม่"));
      if (requestRef.current?.id !== request.id) return;
      const result = payload as ApiResponse;
      const route = readRoute();
      const resultAge = restoreRoute && route.age !== null ? route.age : calculateFullAge(params.birth_date);
      const resultPage: Page = restoreRoute ? route.page : "reading";
      setData(result);
      setSelectedAge(resultAge);
      setPage(resultPage);
      writeRoute({ page: resultPage, age: resultAge, focus: route.focus });
      setStatus(`คำนวณดวงชะตาของ ${result.profile.name} แล้ว`);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      if (requestRef.current?.id === request.id) setError(reason instanceof Error ? reason.message : "ไม่สามารถเชื่อมต่อเครื่องคำนวณได้");
    } finally {
      if (requestRef.current?.id === request.id) setLoading(false);
    }
  }, []);

  const loadProfiles = useCallback(async (token: string, autoCalculate = false, generation = authGenerationRef.current) => {
    const response = await fetch("/api/profiles", { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error("ไม่สามารถโหลดโปรไฟล์ได้");
    const list = (await response.json()) as BirthProfile[];
    if (generation !== authGenerationRef.current) return undefined;
    setProfiles(list);
    if (autoCalculate && list.length) {
      const completeProfiles = list.filter((item) => item.birth_data_complete !== false);
      const profile = completeProfiles.find((item) => item.is_default) ?? completeProfiles[0];
      if (!profile) {
        setError("ข้อมูลเกิดของโปรไฟล์ที่บันทึกไว้ไม่ครบ กรุณาตรวจสอบและกรอกใหม่ก่อนคำนวณ");
        return list;
      }
      await calculate({
        name: profile.name,
        birth_date: profile.birth_date,
        birth_time: profile.birth_time,
        latitude: profile.latitude,
        longitude: profile.longitude,
        tz_offset: profile.tz_offset,
        location_name: profile.location_name,
      }, profile.id, true);
    }
    return list;
  }, [calculate]);

  useEffect(() => {
    const controller = new AbortController();
    const generation = ++authGenerationRef.current;
    fetch("/api/cities", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setCities(await response.json());
      })
      .catch((reason) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setCitiesError("โหลดรายชื่อเมืองไม่สำเร็จ คุณยังเลือก “ระบุสถานที่เอง” และกรอกพิกัดกับ UTC offset ที่ตรวจสอบแล้วได้");
      });

    const token = localStorage.getItem("solarian_token");
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
        .then(async (response) => {
          if (response.status === 401) throw new Error("AUTH_EXPIRED");
          if (!response.ok) throw new Error("ACCOUNT_UNAVAILABLE");
          const user = await response.json();
          if (generation !== authGenerationRef.current) return;
          setCurrentUser(user);
          await loadProfiles(token, true, generation);
        })
        .catch((reason) => {
          if (reason instanceof DOMException && reason.name === "AbortError") return;
          if (generation !== authGenerationRef.current) return;
          if (reason instanceof Error && reason.message === "AUTH_EXPIRED") {
            localStorage.removeItem("solarian_token");
            setCurrentUser(null);
          } else {
            setError("เชื่อมต่อบัญชีไม่ได้ในขณะนี้ ข้อมูลแผนบนหน้านี้ยังใช้งานต่อได้");
          }
        });
    }
    return () => controller.abort();
  }, [loadProfiles]);

  const sun = data?.chart.planets_dict.Sun;
  const sunAspects = useMemo(() => (data?.chart.aspects ?? [])
    .filter((aspect) => aspect.body1 === "Sun" || aspect.body2 === "Sun")
    .sort((a, b) => a.orb - b.orb), [data]);
  const selectedYear: YearEntry | undefined = data?.timeline.years_map.find((entry) => entry.age === selectedAge);
  const selectedMajor = data?.timeline.major_periods.find((period) => period.start_age <= selectedAge && (selectedAge < period.end_age || (selectedAge === 108 && period.end_age === 108)));
  const selectedMajorLegend = selectedYear ? planetDeityLegends[selectedYear.major_planet.name] : undefined;
  const selectedSub = selectedMajor?.sub_periods.find((period) => period.start_age <= selectedAge && (selectedAge < period.end_age || (selectedAge === 108 && period.end_age === 108)));
  const selectedTransit = data?.transits_map.find((item) => item.age === selectedAge);
  const solarTransits = (selectedTransit?.active_aspects ?? []).filter((item: { natal_target?: string }) => item.natal_target === "Sun");
  const selectedDegreeHits = selectedYear?.degree_triggers ?? selectedYear?.reading?.degree_triggers ?? [];
  const selectedDegreeDetails = selectedYear?.reading?.degree_trigger_details?.length
    ? selectedYear.reading.degree_trigger_details
    : selectedYear?.reading?.degree_trigger_detail
      ? [selectedYear.reading.degree_trigger_detail]
      : [];
  const triggerPlanetNames = Array.from(new Set(selectedDegreeHits.map((hit) => hit.planet_name)));
  const activeTriggerFilter = triggerFilter === "all" || triggerPlanetNames.includes(triggerFilter) ? triggerFilter : "all";
  const visibleDegreeHits = activeTriggerFilter === "all"
    ? selectedDegreeHits
    : selectedDegreeHits.filter((hit) => hit.planet_name === activeTriggerFilter);

  function changePage(nextPage: Page) {
    setPage(nextPage);
    writeRoute({ page: nextPage, age: selectedAge, focus }, "push");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectAge(value: number) {
    if (!Number.isFinite(value)) return;
    const nextAge = Math.max(0, Math.min(108, Math.round(value)));
    setSelectedAge(nextAge);
    setTriggerFilter("all");
    writeRoute({ page, age: nextAge, focus });
  }

  async function exportPdf() {
    if (!currentParams) return;
    setExporting(true);
    setError("");
    try {
      const response = await fetch("/api/chart/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentParams),
      });
      if (!response.ok) throw new Error("สร้างไฟล์ PDF ไม่สำเร็จ");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Solarian_${currentParams.name}_${currentParams.birth_date}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ดาวน์โหลด PDF ไม่สำเร็จ");
    } finally {
      setExporting(false);
    }
  }

  async function selectProfile(profile: BirthProfile) {
    if (profile.birth_data_complete === false) {
      setError("ข้อมูลเกิดของโปรไฟล์นี้ไม่ครบ กรุณาตรวจสอบและกรอกใหม่ก่อนคำนวณ");
      return;
    }
    setActiveProfileId(profile.id);
    await calculate({
      name: profile.name,
      birth_date: profile.birth_date,
      birth_time: profile.birth_time,
      latitude: profile.latitude,
      longitude: profile.longitude,
      tz_offset: profile.tz_offset,
      location_name: profile.location_name,
    }, profile.id);
  }

  async function persistProfile(params: BirthParams, token: string, generation: number) {
    if (profileSaveRef.current) return;
    const controller = new AbortController();
    profileSaveRef.current = controller;
    const snapshot = JSON.stringify(params);
    setSavingProfile(true);
    setStatus("");
    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...params, relationship: "self" }),
        signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(extractError(payload, "บันทึกโปรไฟล์ไม่สำเร็จ"));
      if (generation !== authGenerationRef.current || snapshot !== JSON.stringify(currentParamsRef.current)) return;
      setProfiles((items) => [payload, ...items.filter((item) => item.id !== payload.id)]);
      setActiveProfileId(payload.id);
      setStatus(`บันทึกโปรไฟล์ ${payload.name} ในบัญชีแล้ว`);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      if (generation === authGenerationRef.current) setError(reason instanceof Error ? reason.message : "บันทึกโปรไฟล์ไม่สำเร็จ");
    } finally {
      if (profileSaveRef.current === controller) {
        profileSaveRef.current = null;
        setSavingProfile(false);
      }
    }
  }

  async function saveProfile() {
    if (!currentParams || savingProfile) return;
    const token = localStorage.getItem("solarian_token");
    if (!token) { pendingProfileRef.current = { ...currentParams }; setAccountOpen(true); return; }
    await persistProfile({ ...currentParams }, token, authGenerationRef.current);
  }

  function logout() {
    authGenerationRef.current += 1;
    requestRef.current?.controller.abort();
    requestRef.current = null;
    profileSaveRef.current?.abort();
    profileSaveRef.current = null;
    pendingProfileRef.current = null;
    setSavingProfile(false);
    localStorage.removeItem("solarian_token");
    setCurrentUser(null);
    setProfiles([]);
    setActiveProfileId(null);
    setStatus("ออกจากบัญชีแล้ว ข้อมูลที่คำนวณบนหน้านี้ยังอยู่จนกว่าจะรีเฟรช");
  }

  return (
    <div className="sj-app">
      <a className="sj-skip" href="#main">ข้ามไปเนื้อหาหลัก</a>
      <header className="sj-header">
        <button className="sj-brand" onClick={() => changePage("reading")} aria-label="สุริยวิถี หน้าดวงชะตา">
          <Sun aria-hidden="true" /><span>สุริยวิถี<small>SOLAR ATLAS</small></span>
        </button>
        <nav aria-label="เมนูหลัก">
          <button aria-current={page === "reading" ? "page" : undefined} onClick={() => changePage("reading")}>ดวงชะตา</button>
          <button aria-current={page === "pro" ? "page" : undefined} onClick={() => changePage("pro")}>วิเคราะห์เชิงลึก</button>
          <button aria-current={page === "bazi" ? "page" : undefined} onClick={() => changePage("bazi")}>ปาจื่อ (4 เสา)</button>
          <button aria-current={page === "connections" ? "page" : undefined} onClick={() => changePage("connections")}>ผู้ร่วมทาง</button>
          <button aria-current={page === "ai" ? "page" : undefined} onClick={() => changePage("ai")}>AI ปรึกษาดวง</button>
        </nav>
        <div className="sj-account-actions">
          {currentUser ? (
            <>
              <span className="sj-account-name">{currentUser.email}</span>
              <button className="sj-icon-button" onClick={logout} aria-label="ออกจากระบบ">
                <LogOut aria-hidden="true" />
              </button>
            </>
          ) : (
            <button className="sj-button sj-soft" onClick={() => setAccountOpen(true)}>
              <LogIn aria-hidden="true" />บัญชี
            </button>
          )}
        </div>
      </header>

      <p className="sj-live" role="status" aria-live="polite">{status}</p>
      {error && (
        <div className="sj-global-alert" role="alert">
          <CircleAlert aria-hidden="true" />
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="ปิดข้อความผิดพลาด"><X aria-hidden="true" /></button>
        </div>
      )}

      {/* 1. ดวงชะตา (Reading View) */}
      {page === "reading" && (
        <main id="main" tabIndex={-1}>
          {!data && (
            <>
              <section className="sj-hero">
                <div className="sj-hero-copy">
                  <p className="sj-kicker">โหราศาสตร์ตะวันตก ผสานมหาทักษาและปาจื่อ</p>
                  <h1>สุริยวิถี<br />เจาะลึกพิมพ์เขียวชีวิต<br /><em>จากภาพใหญ่สู่การลงมือจริง</em></h1>
                  <p>คำนวณตำแหน่งดวงดาวแม่นยำระดับฟิสิกส์ดาราศาสตร์ (DE431) สรุปทิศทางชีวิตประจำวัน พร้อมวิเคราะห์พื้นดวงและจังหวะชีวิต</p>
                  <a className="sj-button sj-primary" href="#birth-setup"><Sparkles aria-hidden="true" />คำนวณดวงชะตา</a>
                  <small>ระบบคำนวณตำแหน่งดาวจริงตามพิกัดเวลาเกิด พร้อมมหาทักษา 108 ปี และปาจื่อห้าธาตุ</small>
                </div>
                <figure className="sj-hero-art">
                  <img src="/assets/phiphek-material.png" width="1254" height="1254" alt="ภาพพิเภกถือดวงอาทิตย์และอ่านแผนที่ฟ้า สื่อถึงการให้คำปรึกษาจากภาพใหญ่" />
                  <figcaption>มองสัญญาณ · ตรวจเหตุผล · วางก้าวถัดไป</figcaption>
                </figure>
              </section>
              <div id="birth-setup" className="sj-page sj-setup-wrap">
                <BirthSetup cities={cities} citiesError={citiesError} initial={currentParams} loading={loading} onCalculate={calculate} />
              </div>
            </>
          )}

          {data && currentParams && (
            <section className="sj-page sj-results" ref={resultRef} aria-labelledby="reading-title">
              {/* Profile Bar */}
              <div className="sj-profile-bar sj-raised">
                <div>
                  <p className="sj-kicker">ดวงชะตาของ</p>
                  <h1 id="reading-title">{data.profile.name}</h1>
                  <p>
                    <MapPin aria-hidden="true" /> {data.profile.location_name} · {formatThaiDate(currentParams.birth_date)} เวลา {currentParams.birth_time} · UTC {currentParams.tz_offset >= 0 ? "+" : ""}{currentParams.tz_offset}
                  </p>
                </div>
                <div className="sj-profile-actions">
                  {profiles.length > 0 && (
                    <label>
                      เลือกโปรไฟล์
                      <select
                        value={activeProfileId ?? ""}
                        onChange={(event) => {
                          const profile = profiles.find((item) => item.id === Number(event.target.value));
                          if (profile) selectProfile(profile);
                        }}
                      >
                        <option value="" disabled>เลือก</option>
                        {profiles.map((profile) => (
                          <option key={profile.id} value={profile.id} disabled={profile.birth_data_complete === false}>
                            {profile.name}{profile.is_default ? " · หลัก" : ""}{profile.birth_data_complete === false ? " · ข้อมูลไม่ครบ" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <button className="sj-button sj-soft" onClick={saveProfile} disabled={savingProfile}>
                    <Save aria-hidden="true" />{savingProfile ? "กำลังบันทึก…" : currentUser ? "บันทึกโปรไฟล์" : "บันทึกผ่านบัญชี"}
                  </button>
                  <button className="sj-button sj-quiet" onClick={() => { setData(null); setStatus(""); }}>
                    แก้ไขข้อมูลเกิด
                  </button>
                </div>
              </div>

              {/* Daily Guidance Dashboard (ผลสรุปดวงประจำวัน) */}
              <GuidanceDashboard guidance={data.guidance} activeTab={guidanceTab} onTabChange={setGuidanceTab} />

              {/* Core Natal Analysis (บทวิเคราะห์พื้นดวง) */}
              <SimpleReadingView
                data={data}
                onSwitchToPro={() => changePage("pro")}
                onSwitchToBazi={() => changePage("bazi")}
                onSwitchToAi={() => changePage("ai")}
                onExportPdf={exportPdf}
                isExporting={exporting}
                selectedPlanet={selectedPlanet}
                onSelectPlanet={setSelectedPlanet}
              />
            </section>
          )}
        </main>
      )}

      {/* 2. วิเคราะห์เชิงลึก (Pro Astrology Studio) */}
      {page === "pro" && (
        <main className="sj-page" id="main" tabIndex={-1}>
          {!data ? (
            <div className="sj-empty sj-raised">
              <FileClock aria-hidden="true" />
              <h2>กรุณาคำนวณดวงชะตาก่อนเปิดการวิเคราะห์เชิงลึก</h2>
              <p>ใส่ข้อมูลวันเดือนปีเกิดและเวลาเกิดในหน้าดวงชะตา เพื่อเปิดระบบวิเคราะห์เต็มรูปแบบ</p>
              <button className="sj-button sj-primary" onClick={() => changePage("reading")}>ไปที่หน้าดวงชะตา</button>
            </div>
          ) : currentParams && selectedYear && sun && (
            <div className="sj-results" style={{ display: "grid", gap: "24px" }}>
              {/* Pro Header with PDF Export */}
              <div className="sj-section-heading">
                <div>
                  <p className="sj-kicker">สำหรับผู้ศึกษาโหราศาสตร์และวิเคราะห์ขั้นสูง</p>
                  <h1>ห้องวิเคราะห์ดวงเชิงลึก (Pro Astrology Studio)</h1>
                  <p style={{ color: "var(--sj-muted)", marginTop: "4px" }}>
                    เจ้าชะตา: <strong>{data.profile.name}</strong> · ลัคนา {data.chart.angles.Ascendant.sign_thai} {data.chart.angles.Ascendant.formatted_dms} · อายุ {selectedAge} ปี
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button className="sj-button sj-primary" onClick={exportPdf} disabled={exporting}>
                    <Download aria-hidden="true" />{exporting ? "กำลังสร้าง PDF…" : "ดาวน์โหลด PDF รายงานเต็ม"}
                  </button>
                </div>
              </div>

              {/* 1. Placidus Natal Wheel */}
              <section className="sj-raised" style={{ padding: "20px" }}>
                <div className="sj-section-heading" style={{ marginBottom: "16px" }}>
                  <div>
                    <p className="sj-kicker">จักรราศีและเรือนชะตา (Placidus Natal Chart Wheel)</p>
                    <h2>วงล้อดวงกำเนิด พลาซีดัส</h2>
                  </div>
                </div>
                <NatalWheel chart={data.chart} selectedPlanet={selectedPlanet} onSelectPlanet={setSelectedPlanet} theme="light" />
              </section>

              {/* 2. 108-Year Life Map & True Solar Arc 30° harmonic triggers */}
              <section className="sj-macro sj-raised" aria-labelledby="macro-title">
                <div className="sj-section-heading">
                  <div>
                    <p className="sj-kicker">01 · ภาพใหญ่ก่อนรายละเอียด</p>
                    <h2 id="macro-title">วงรอบชีวิต 108 ปี (มหาทักษา)</h2>
                  </div>
                  <span className="sj-age-now">วันนี้อายุเต็ม {calculateFullAge(currentParams.birth_date)} ปี</span>
                </div>
                <PeriodOverview periods={data.timeline.major_periods} selectedAge={selectedAge} onSelect={selectAge} />
                <div className="sj-age-axis" aria-hidden="true"><span>0 ปี</span><span>54 ปี</span><span>108 ปี</span></div>
                <div className="sj-year-explorer">
                  <div className="sj-year-title">
                    <div>
                      <p className="sj-kicker">สำรวจทีละ 1 ปี</p>
                      <h3>อายุ {selectedAge} ปี · ค.ศ. {selectedYear.calendar_year}</h3>
                    </div>
                    <button className="sj-button sj-quiet" onClick={() => selectAge(calculateFullAge(currentParams.birth_date))}>
                      <CalendarDays aria-hidden="true" />กลับสู่อายุปัจจุบัน
                    </button>
                  </div>
                  <label htmlFor="age-slider">เลื่อนดูอายุ 0–108 ปี</label>
                  <input
                    id="age-slider"
                    className="sj-slider"
                    type="range"
                    min="0"
                    max="108"
                    step="1"
                    value={selectedAge}
                    aria-valuetext={`อายุ ${selectedAge} ปี ค.ศ. ${selectedYear.calendar_year}`}
                    onChange={(event) => selectAge(Number(event.target.value))}
                  />
                  <div className="sj-age-controls">
                    <button className="sj-button sj-soft" disabled={selectedAge === 0} onClick={() => selectAge(selectedAge - 1)}>
                      <ArrowLeft aria-hidden="true" />ปีก่อน
                    </button>
                    <label>
                      <span>ไปที่อายุ</span>
                      <input
                        aria-label="ไปที่อายุ 0 ถึง 108 ปี"
                        type="number"
                        min="0"
                        max="108"
                        step="1"
                        value={selectedAge}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          if (event.target.value !== "" && Number.isInteger(value) && value >= 0 && value <= 108) selectAge(value);
                        }}
                      />
                      <span>ปี</span>
                    </label>
                    <button className="sj-button sj-soft" disabled={selectedAge === 108} onClick={() => selectAge(selectedAge + 1)}>
                      ปีถัดไป<ArrowRight aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sj-ruler-grid" aria-live="polite">
                    <article>
                      <span>ดาวเสวยอายุ · ภาพใหญ่</span>
                      <strong>{selectedYear.major_planet.symbol} ดาว{selectedYear.major_planet.thai}</strong>
                      <small>{selectedMajor ? `${formatThaiDate(selectedMajor.start_date)} – ${formatThaiDate(selectedMajor.end_date)}` : "—"}</small>
                    </article>
                    <article>
                      <span>ดาวแทรก · ช่วงย่อย</span>
                      <strong>{selectedYear.sub_planet.symbol} ดาว{selectedYear.sub_planet.thai}</strong>
                      <small>{selectedSub ? `${formatThaiDate(selectedSub.start_date)} – ${formatThaiDate(selectedSub.end_date)}` : selectedYear.sub_duration_str}</small>
                    </article>
                    <article>
                      <span>ทักษาจร · อายุย่าง {selectedYear.age_yang}</span>
                      <strong>{selectedYear.annual_thaksa.symbol} ดาว{selectedYear.annual_thaksa.thai}</strong>
                      <small>ปีตั้งต้น ค.ศ. {selectedYear.calendar_year}</small>
                    </article>
                  </div>
                </div>
              </section>

              {/* Solar Core */}
              <section className="sj-solar sj-raised" aria-labelledby="solar-title">
                <div className="sj-section-heading">
                  <div>
                    <p className="sj-kicker">02 · THE SOLAR CORE</p>
                    <h2 id="solar-title">อาทิตย์เป็นแกน มุมสัมพันธ์เป็นบริบท</h2>
                  </div>
                  <span className="sj-source">ผลจากเครื่องคำนวณดวงกำเนิด</span>
                </div>
                <div className="sj-sun-layout">
                  <article className="sj-sun-card">
                    <ArtTile atlas="zodiac" index={zodiacArtIndex[sun.sign]} className="sj-zodiac-art" />
                    <div>
                      <span>ดวงอาทิตย์กำเนิด</span>
                      <h3>{sun.sign_thai} · {sun.formatted_dms}</h3>
                      <p>เรือน {sun.house} · ลองจิจูด {sun.longitude.toFixed(4)}°</p>
                      <small className="sj-art-note">ภาพวาดตีความเชิงศิลป์</small>
                    </div>
                  </article>
                  <div className="sj-aspect-list">
                    <h3>มุมสัมพันธ์สู่อาทิตย์ทั้งหมด ({sunAspects.length})</h3>
                    {sunAspects.length ? sunAspects.map((aspect, index) => {
                      const other = otherAspectBody(aspect);
                      return (
                        <article key={`${other.name}-${aspect.aspect_name}-${index}`}>
                          <span className="sj-aspect-symbol">{other.symbol || "•"}</span>
                          <div>
                            <strong>{bodyLabel(other)} {aspect.aspect_thai}</strong>
                            <p>{aspect.aspect_name} · orb {aspect.orb_str || `${aspect.orb.toFixed(2)}°`} · {aspect.is_applying ? "กำลังเข้าใกล้มุม" : "กำลังแยกจากมุม"}</p>
                          </div>
                        </article>
                      );
                    }) : <p className="sj-muted">ไม่พบมุมสัมพันธ์สู่อาทิตย์ภายในเกณฑ์ orb ของเครื่องคำนวณ</p>}
                  </div>
                </div>
              </section>

              {/* Harmonic 30° Triggers */}
              <section className="sj-harmonic sj-raised" aria-labelledby="harmonic-title">
                <div className="sj-section-heading">
                  <div>
                    <p className="sj-kicker">03 · ภาพใหญ่และจุดกระตุ้น</p>
                    <h2 id="harmonic-title">วิถีองศาดาวกระทบฐาน 30° และบริบทสองชั้น</h2>
                  </div>
                  <span className="sj-source">True Solar Arc + Harmonic 30°</span>
                </div>
                <div className="sj-harmonic-layers">
                  <article className="sj-harmonic-macro">
                    <div className="sj-layer-heading"><span>ชั้นที่ 1 · บริบทระยะยาว</span><strong>ภาพใหญ่</strong></div>
                    <div className="sj-harmonic-ruler">
                      <ArtTile atlas="planet" index={planetArtIndex[selectedYear.major_planet.name]} className="sj-planet-art" />
                      <div>
                        <small>ดาวเสวยอายุ · {selectedYear.major_planet.symbol}</small>
                        <h3>ดาว{selectedYear.major_planet.thai}</h3>
                        <small className="sj-art-note">ภาพวาดตีความเชิงศิลป์</small>
                      </div>
                    </div>
                    {selectedMajorLegend && (
                      <div className="sj-deity-facts">
                        <p>ที่มาภาพตามเรื่องเล่าที่ใช้ในแอป</p>
                        <dl>
                          <div><dt>กำเนิดจาก</dt><dd>{selectedMajorLegend.origin}</dd></div>
                          <div><dt>กำลังดาว</dt><dd>{selectedMajorLegend.power}</dd></div>
                          <div><dt>สีประจำวัน</dt><dd><span className="sj-color-dot" style={{ backgroundColor: selectedMajorLegend.dayColorHex }} aria-hidden="true" />{selectedMajorLegend.dayColor}</dd></div>
                          <div><dt>สีผ้าในตำนาน</dt><dd>{selectedMajorLegend.clothColor}</dd></div>
                        </dl>
                        <p className="sj-deity-reflection"><strong>กุศโลบาย: ข้อคิดชวนทบทวน (การตีความของแอป)</strong>{selectedMajorLegend.reflection}</p>
                      </div>
                    )}
                    <p>{cleanInterpretation(selectedYear.reading?.macro_detail?.epoch_title || `ดาว${selectedYear.major_planet.thai}เป็นบริบทใหญ่ของช่วงชีวิตที่กำลังดู`)}</p>
                    <dl>
                      <div><dt>ช่วงอ้างอิง</dt><dd>{selectedMajor ? `${formatThaiDate(selectedMajor.start_date)} – ${formatThaiDate(selectedMajor.end_date)}` : "—"}</dd></div>
                      <div><dt>ปีที่กำลังดู</dt><dd>อายุ {selectedAge} ปี · ค.ศ. {selectedYear.calendar_year}</dd></div>
                    </dl>
                    {selectedYear.reading?.macro_detail?.epoch_theme && (
                      <details className="sj-macro-context">
                        <summary>ดูบริบทดาวเสวยอายุเพิ่มเติม <ChevronDown aria-hidden="true" /></summary>
                        <p>{cleanInterpretation(selectedYear.reading.macro_detail.epoch_theme)}</p>
                      </details>
                    )}
                  </article>

                  <div className="sj-harmonic-micro">
                    <div className="sj-layer-heading"><span>ชั้นที่ 2 · จุดซูมเฉพาะบุคคล</span><strong>เรดาร์ปีที่เลือก</strong></div>
                    {selectedDegreeHits.length > 0 ? (
                      <>
                        <div className="sj-trigger-filter" role="group" aria-label="กรองจุดกระตุ้นของปีที่เลือก">
                          <button aria-pressed={activeTriggerFilter === "all"} onClick={() => setTriggerFilter("all")}>ทั้งหมด {selectedDegreeHits.length}</button>
                          {triggerPlanetNames.map((planetName) => {
                            const hit = selectedDegreeHits.find((item) => item.planet_name === planetName)!;
                            return <button key={planetName} aria-pressed={activeTriggerFilter === planetName} onClick={() => setTriggerFilter(planetName)}>{hit.planet_symbol} ดาว{hit.planet_thai}</button>;
                          })}
                        </div>
                        <div className="sj-trigger-list" aria-live="polite">
                          {visibleDegreeHits.map((hit, index) => {
                            const detail = selectedDegreeDetails.find((item) => item.planet_name === hit.planet_name && Math.abs(item.exact_age - hit.exact_age) < 0.02)
                              ?? selectedDegreeDetails.find((item) => item.planet_name === hit.planet_name);
                            return (
                              <article className="sj-trigger-card" key={`${hit.planet_name}-${hit.exact_age}-${index}`}>
                                <div className="sj-trigger-title">
                                  <span className="sj-trigger-symbol" aria-hidden="true">{hit.planet_symbol}</span>
                                  <div>
                                    <small>จุดกระตุ้นรอบที่ {hit.cycle_num}</small>
                                    <h3>ดาว{hit.planet_thai}</h3>
                                  </div>
                                  <div className="sj-trigger-badges">
                                    <span className="sj-status">ระยะ {hit.distance_deg.toFixed(2)}°</span>
                                    {hit.sun_speed && hit.sun_speed !== 1.0 && (
                                      <span className="sj-status" style={{ background: "var(--sj-gold-wash)", color: "var(--sj-coral-deep)" }}>
                                        อัตราจริง {hit.sun_speed.toFixed(4)}°/ปี
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="sj-trigger-age">
                                  <strong>อายุเชิงสัญลักษณ์ {formatExactTriggerAge(hit.exact_age)}</strong>
                                  <span>คำนวณตามอัตราเร็วสุริยะจริง แสดงในช่องอายุ {selectedAge} ปีตามการปัดค่าของสูตร</span>
                                </p>
                                {detail ? (
                                  <div className="sj-trigger-reading">
                                    <p>{cleanInterpretation(detail.trigger_narrative)}</p>
                                    <dl>
                                      <div><dt>ขอบเขตที่ใช้ทบทวน</dt><dd>{detail.house_name} · {detail.house_area}</dd></div>
                                      <div><dt>บริบทคู่ดาว</dt><dd>{cleanInterpretation(detail.pair_type)} · {detail.dignity_label}</dd></div>
                                    </dl>
                                    {detail.sun_in_sign_degree != null && detail.planet_in_sign_degree != null && (
                                      <details className="sj-trigger-source">
                                        <summary>ที่มาของค่า <ChevronDown aria-hidden="true" /></summary>
                                        <p>อาทิตย์ {detail.sun_in_sign_degree.toFixed(2)}° → ดาว{detail.planet_thai} {detail.planet_in_sign_degree.toFixed(2)}° ภายในฐาน 30°{detail.natal_sign || detail.natal_degree ? ` · ดาวกำเนิดอยู่${detail.natal_sign ?? ""}${detail.natal_degree ? ` ${detail.natal_degree}` : ""}` : ""}</p>
                                      </details>
                                    )}
                                    {detail.planning_question && <div className="sj-trigger-question"><span>คำถามวางแผน</span><strong>{cleanInterpretation(detail.planning_question)}</strong></div>}
                                    {detail.practical_actions?.length ? (
                                      <div className="sj-trigger-actions">
                                        <span>สิ่งที่นำไปทำต่อได้</span>
                                        <ul>{detail.practical_actions.slice(0, 2).map((action, actionIndex) => <li key={`${hit.planet_name}-action-${actionIndex}`}>{cleanInterpretation(action)}</li>)}</ul>
                                      </div>
                                    ) : null}
                                    {detail.decision_check && <p className="sj-trigger-check"><strong>ก่อนตัดสินใจ:</strong> {cleanInterpretation(detail.decision_check)}</p>}
                                  </div>
                                ) : (
                                  <p className="sj-trigger-pending">มีค่าที่สูตรจัดไว้ในช่องอายุนี้ แต่เครื่องคำนวณรุ่นนี้ยังไม่ส่งรายละเอียดคำตีความของรายการนี้</p>
                                )}
                              </article>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="sj-no-trigger">
                        <Compass aria-hidden="true" />
                        <div>
                          <h3>ปีนี้ไม่มีจุดกระตุ้นฐาน 30°</h3>
                          <p>ไม่พบอายุเชิงสัญลักษณ์ที่ถูกจัดในช่องอายุ {selectedAge} ปีตามการปัดค่าของสูตร สถานะนี้ไม่ได้แปลว่าจะไม่มีเหตุการณ์สำคัญ และไม่เปลี่ยนบริบทจากดาวเสวยอายุด้านซ้าย</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <details className="sj-deity-legend">
                  <summary>ดูที่มาภาพดาวทั้ง 8 ตามเรื่องเล่าที่ใช้ในแอป <ChevronDown aria-hidden="true" /></summary>
                  <p className="sj-deity-legend-intro">ตามเรื่องเล่าที่ใช้ในแอป พระอิศวรทรงนำสัตว์หรือองค์ประกอบแต่ละชนิดมาชุบสร้าง ห่อด้วยผ้าตามสีในตำนาน และพรมน้ำอมฤต จำนวนต้นกำเนิดใช้เล่าที่มาของกำลังดาว สีประจำวันกับสีผ้าในตำนานจึงแสดงแยกกัน <strong>กำลังดาวทั้ง 8 รวม 108</strong> กุศโลบายท้ายแต่ละรายการเป็นการตีความของแอปสำหรับทบทวน ไม่ใช่ข้อความอ้างอิงคัมภีร์หรือข้อยืนยันว่าเป็นคำอธิบายมาตรฐานเดียว</p>
                  <ul>
                    {deityLegendOrder.map((planetName) => {
                      const legend = planetDeityLegends[planetName];
                      return (
                        <li key={planetName}>
                          <div className="sj-deity-legend-title">
                            <span className="sj-color-dot" style={{ backgroundColor: legend.dayColorHex }} aria-hidden="true" />
                            <strong>{legend.symbol} ดาว{legend.thai}</strong>
                            <span>กำลัง {legend.power}</span>
                          </div>
                          <p>{legend.origin} · สีประจำวัน{legend.dayColor} · สีผ้าในตำนาน{legend.clothColor}</p>
                          <small><strong>กุศโลบาย: ข้อคิดชวนทบทวน (การตีความของแอป):</strong> {legend.reflection}</small>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="sj-ketu-note"><strong>เกตุ:</strong> ตามเรื่องเล่าที่ใช้ในแอปเกิดจากนาค 9 ตัวและใช้เป็นมณฑลกลาง จึงไม่ได้รวมเป็นดาวเสวยอายุในวงรอบ 108 ปีชุดนี้ และไม่มีการเปลี่ยนวิธีคำนวณของ engine</p>
                </details>
                <details className="sj-harmonic-method">
                  <summary>วิธีอ่านฐาน 30° นี้คำนวณอย่างไร <ChevronDown aria-hidden="true" /></summary>
                  <p>ระบบเทียบองศาภายในราศีของดาวแต่ละดวงกับองศาภายในราศีของดวงอาทิตย์กำเนิดด้วย modulo 30 แล้ววนซ้ำทุก 30 ปี ร่วมกับอัตราความเร็วจริงของดวงอาทิตย์ (True Solar Arc) ค่าอายุทศนิยมเป็นจุดเชิงคณิตศาสตร์ดาราศาสตร์ ส่วนช่องอายุเป็นการจัดกลุ่มตามการปัดค่าของสูตร</p>
                </details>
              </section>

              {/* Transit Section */}
              <section className="sj-selected-year sj-raised" aria-labelledby="selected-year-title">
                <div className="sj-section-heading">
                  <div>
                    <p className="sj-kicker">04 · วันอ้างอิงของปีที่เลือก</p>
                    <h2 id="selected-year-title">หลักฐาน ณ วันเกิดของอายุ {selectedAge} ปี</h2>
                  </div>
                  <span className="sj-source">{selectedTransit?.target_date ? formatThaiDate(selectedTransit.target_date) : "ไม่มีวันที่อ้างอิง"}</span>
                </div>
                <p className="sj-boundary-note"><CircleAlert aria-hidden="true" />ข้อมูลดาวจรชุดนี้คำนวณ ณ วันเกิดของปีที่เลือกหนึ่งวัน ไม่ใช่พยากรณ์รายวันหรือภาพแทนทั้งปี</p>
                <div className="sj-evidence-grid">
                  <article>
                    <h3>ดาวจรที่ทำมุมสู่อาทิตย์</h3>
                    {solarTransits.length ? (
                      <ul>{solarTransits.map((item: any, index: number) => <li key={`${item.transit_planet}-${item.aspect_name}-${index}`}><strong>{item.transit_symbol} ดาว{item.transit_thai} {item.aspect_thai} อาทิตย์เดิม</strong><span>orb {Number(item.orb).toFixed(2)}°</span></li>)}</ul>
                    ) : (
                      <p>ไม่พบมุมจากดาวจรสู่อาทิตย์ภายในเกณฑ์ของวันอ้างอิงนี้</p>
                    )}
                  </article>
                </div>
                {selectedYear.reading && (
                  <div className="sj-interpretation">
                    <div className="sj-interpretation-head"><div><p className="sj-kicker">แนวทางตีความจากกฎของระบบ</p><h3>ภาพของปีนี้สำหรับใช้ตั้งคำถาม</h3></div><span className="sj-status">แยกจากข้อมูลตำแหน่งดาว</span></div>
                    <div className="sj-interpretation-grid">
                      <article><span>บริบทจากดาวเสวยอายุ</span><p>{cleanInterpretation(selectedYear.reading.macro_detail?.epoch_theme || selectedYear.reading.macro_narrative)}</p>{selectedYear.reading.macro_detail?.strategic_focus && <small>{cleanInterpretation(selectedYear.reading.macro_detail.strategic_focus)}</small>}</article>
                      <article><span>ตัวกระตุ้นจากดาวแทรก</span><p>{cleanInterpretation(selectedYear.reading.sub_detail?.catalyst_role || selectedYear.reading.sub_narrative)}</p>{selectedYear.reading.sub_detail?.immediate_caution && <small>{cleanInterpretation(selectedYear.reading.sub_detail.immediate_caution)}</small>}</article>
                    </div>
                    {selectedYear.reading.action_plan && <div className="sj-rule-actions"><article><span>หลักยึดในการตัดสินใจ</span><p>{cleanInterpretation(selectedYear.reading.action_plan.decision_framework)}</p></article><article><span>สิ่งที่ระบบเสนอให้พิจารณา</span><ul>{selectedYear.reading.action_plan.strategic_moves.slice(0, 3).map((move, index) => <li key={`${move}-${index}`}>{cleanInterpretation(move)}</li>)}</ul></article><article><span>เงื่อนไขลดความเสี่ยง</span><ul>{selectedYear.reading.action_plan.risk_mitigation.slice(0, 3).map((risk, index) => <li key={`${risk}-${index}`}>{cleanInterpretation(risk)}</li>)}</ul></article></div>}
                  </div>
                )}
              </section>

              {/* 3. Deep Aspect Dynamics Grid */}
              <section className="sj-raised" style={{ padding: "20px" }}>
                <div className="sj-section-heading" style={{ marginBottom: "16px" }}>
                  <div>
                    <p className="sj-kicker">การวิเคราะห์มุมสัมพันธ์ระดับลึก</p>
                    <h2>พลวัตมุมสัมพันธ์และคู่ดาว (Aspect Dynamics)</h2>
                  </div>
                </div>
                <AspectGrid chart={data.chart} aspectDynamics={data.aspect_dynamics} selectedPlanet={selectedPlanet} onSelectPlanet={setSelectedPlanet} />
              </section>

              {/* 4. Planet Data Table */}
              <section className="sj-raised" style={{ padding: "20px" }}>
                <div className="sj-section-heading" style={{ marginBottom: "16px" }}>
                  <div>
                    <p className="sj-kicker">ตารางข้อมูลพิกัดดาวและมาตรฐานดาว</p>
                    <h2>รายละเอียดตำแหน่งดาวกำเนิด (Natal Planets Table)</h2>
                  </div>
                </div>
                <PlanetTable chart={data.chart} selectedPlanet={selectedPlanet} onSelectPlanet={setSelectedPlanet} />
              </section>
            </div>
          )}
        </main>
      )}

      {/* 3. ปาจื่อ (4 เสา) */}
      {page === "bazi" && (
        <main className="sj-page sj-narrow" id="main" tabIndex={-1}>
          <div className="sj-section-heading">
            <div>
              <p className="sj-kicker">ระบบสี่เสาชะตาชีวิต (Four Pillars of Destiny)</p>
              <h1>พิมพ์เขียวห้าธาตุและปาจื่อ</h1>
            </div>
            {data?.profile && <span className="sj-status">{data.profile.name}</span>}
          </div>
          {data?.bazi ? (
            <BaziCard bazi={data.bazi} currentAge={selectedAge} />
          ) : (
            <div className="sj-guidance-unavailable" role="status">
              <CircleAlert aria-hidden="true" />
              <div>
                <h3>ยังไม่มีข้อมูลปาจื่อ</h3>
                <p>กรุณากลับไปที่หน้า “ดวงชะตา” เพื่อคำนวณดวงชะตาก่อนเปิดดูพิมพ์เขียวปาจื่อ</p>
              </div>
            </div>
          )}
        </main>
      )}

      {/* 4. ผู้ร่วมทาง (Connections / Synastry) */}
      {page === "connections" && (
        <ConnectionsPage
          person1Params={currentParams}
          profiles={profiles}
          cities={cities}
        />
      )}

      {/* 5. AI ปรึกษาดวง (AI Counselor) */}
      {page === "ai" && (
        <main className="sj-page" id="main" tabIndex={-1}>
          <AICounselorView
            currentParams={currentParams}
            user={currentUser as any}
            token={localStorage.getItem("solarian_token")}
            onOpenPaywall={() => setPaywallOpen(true)}
            onOpenAuth={() => setAccountOpen(true)}
            onUserUpdated={(updated) => setCurrentUser(updated as any)}
          />
        </main>
      )}

      {/* Paywall Modal */}
      <AIPaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        token={localStorage.getItem("solarian_token")}
        onUpgradeSuccess={(updated) => {
          setCurrentUser(updated as any);
          setPaywallOpen(false);
          setStatus("อัปเกรดแพ็กเกจเรียบร้อยแล้ว ยินดีต้อนรับสู่ Solarian AI Counselor");
        }}
        currentTier={currentUser?.subscription_tier ?? "free"}
      />

      <footer className="sj-footer">
        <span>สุริยวิถี · Solar Atlas</span>
        <span>โหราศาสตร์เพื่อความเข้าใจตนเองและการตัดสินใจ การวางแผนชีวิตต้องใช้ข้อมูลและการประเมินความเป็นจริงร่วมด้วย</span>
      </footer>

      <AccountDialog
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        onSuccess={async (user, token, savedCurrentOnRegister) => {
          const generation = ++authGenerationRef.current;
          const pending = pendingProfileRef.current;
          pendingProfileRef.current = null;
          setCurrentUser(user);
          try {
            if (pending) {
              const loaded = await loadProfiles(token, false, generation);
              if (generation !== authGenerationRef.current) return;
              if (savedCurrentOnRegister) {
                const saved = loaded?.find((profile) => profile.name === pending.name && profile.birth_date === pending.birth_date && profile.birth_time === pending.birth_time);
                if (saved) setActiveProfileId(saved.id);
                setStatus(`บันทึกโปรไฟล์ ${pending.name} พร้อมบัญชีแล้ว`);
              } else {
                await persistProfile(pending, token, generation);
              }
            } else {
              await loadProfiles(token, true, generation);
            }
          } catch (reason) {
            if (generation === authGenerationRef.current) setError(reason instanceof Error ? reason.message : "โหลดโปรไฟล์ไม่สำเร็จ");
          }
        }}
        currentChart={data ? currentParams : null}
      />
    </div>
  );
}
