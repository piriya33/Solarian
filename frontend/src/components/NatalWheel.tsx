import React, { useState } from 'react';
import type { ChartResult, PlanetData } from '../types';
import { Eye, EyeOff, RotateCcw, Filter } from 'lucide-react';
import { ZodiacIcon } from './ZodiacIcon';

interface NatalWheelProps {
  chart: ChartResult;
  selectedPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
  theme?: 'light' | 'dark';
}

const ZODIAC_SYMBOLS = [
  { name: 'Aries', thai: 'เมษ', color: '#f87171', lightColor: '#dc2626', bg: 'rgba(239, 68, 68, 0.14)', lightBg: 'rgba(239, 68, 68, 0.10)', element: 'Fire' },
  { name: 'Taurus', thai: 'พฤษภ', color: '#34d399', lightColor: '#059669', bg: 'rgba(16, 185, 129, 0.14)', lightBg: 'rgba(16, 185, 129, 0.10)', element: 'Earth' },
  { name: 'Gemini', thai: 'เมถุน', color: '#fbbf24', lightColor: '#d97706', bg: 'rgba(245, 158, 11, 0.14)', lightBg: 'rgba(245, 158, 11, 0.10)', element: 'Air' },
  { name: 'Cancer', thai: 'กรกฎ', color: '#38bdf8', lightColor: '#0284c7', bg: 'rgba(56, 189, 248, 0.14)', lightBg: 'rgba(56, 189, 248, 0.10)', element: 'Water' },
  { name: 'Leo', thai: 'สิงห์', color: '#f87171', lightColor: '#dc2626', bg: 'rgba(239, 68, 68, 0.14)', lightBg: 'rgba(239, 68, 68, 0.10)', element: 'Fire' },
  { name: 'Virgo', thai: 'กันย์', color: '#34d399', lightColor: '#059669', bg: 'rgba(16, 185, 129, 0.14)', lightBg: 'rgba(16, 185, 129, 0.10)', element: 'Earth' },
  { name: 'Libra', thai: 'ตุลย์', color: '#fbbf24', lightColor: '#d97706', bg: 'rgba(245, 158, 11, 0.14)', lightBg: 'rgba(245, 158, 11, 0.10)', element: 'Air' },
  { name: 'Scorpio', thai: 'พิจิก', color: '#38bdf8', lightColor: '#0284c7', bg: 'rgba(56, 189, 248, 0.14)', lightBg: 'rgba(56, 189, 248, 0.10)', element: 'Water' },
  { name: 'Sagittarius', thai: 'ธนู', color: '#f87171', lightColor: '#dc2626', bg: 'rgba(239, 68, 68, 0.14)', lightBg: 'rgba(239, 68, 68, 0.10)', element: 'Fire' },
  { name: 'Capricorn', thai: 'มังกร', color: '#34d399', lightColor: '#059669', bg: 'rgba(16, 185, 129, 0.14)', lightBg: 'rgba(16, 185, 129, 0.10)', element: 'Earth' },
  { name: 'Aquarius', thai: 'กุมภ์', color: '#fbbf24', lightColor: '#d97706', bg: 'rgba(245, 158, 11, 0.14)', lightBg: 'rgba(245, 158, 11, 0.10)', element: 'Air' },
  { name: 'Pisces', thai: 'มีน', color: '#38bdf8', lightColor: '#0284c7', bg: 'rgba(56, 189, 248, 0.14)', lightBg: 'rgba(56, 189, 248, 0.10)', element: 'Water' },
];

export const NatalWheel: React.FC<NatalWheelProps> = ({
  chart,
  selectedPlanet,
  onSelectPlanet,
  theme = 'light',
}) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(theme);
  React.useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);
  const isDark = currentTheme !== 'light';
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetData | null>(null);
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [aspectFilter, setAspectFilter] = useState<'all' | 'harmonious' | 'challenging' | 'none'>('all');
  const [showDegrees, setShowDegrees] = useState<boolean>(true);

  // SVG Geometry Dimensions (760x760 provides ample padding for AC/DC/MC/IC markers)
  const size = 760;
  const cx = size / 2;
  const cy = size / 2;

  const rOuter = 300;
  const rZodiacInner = 258;
  const rHousesInner = 200;
  const rAspects = 142;

  const ascDeg = chart.angles.Ascendant.longitude;

  /**
   * Exact AstroDienst Astrological Coordinate Transform:
   * - Ascendant (L = ascDeg) is at 9 o'clock (Left): x = cx - r, y = cy
   * - Counter-Clockwise progression:
   *   * As longitude increases, it sweeps through bottom (House 1, 2, 3), right (House 6, 7 / DC), top (House 9, 10 / MC)
   * - Midheaven (MC, L ~ ascDeg - 90°) is at 12 o'clock (Top): x = cx, y = cy - r
   * - Descendant (DC, L = ascDeg + 180°) is at 3 o'clock (Right): x = cx + r, y = cy
   * - Imum Coeli (IC, L ~ ascDeg + 90°) is at 6 o'clock (Bottom): x = cx, y = cy + r
   */
  const toSvgCoords = (longitude: number, radius: number) => {
    const deltaRad = (((longitude - ascDeg) % 360.0 + 360.0) % 360.0) * (Math.PI / 180.0);
    return {
      x: cx - radius * Math.cos(deltaRad),
      y: cy + radius * Math.sin(deltaRad),
    };
  };

  // Helper to build SVG arc path for a zodiac or house segment
  const describeArc = (startLon: number, endLon: number, rIn: number, rOut: number) => {
    const p1 = toSvgCoords(startLon, rOut);
    const p2 = toSvgCoords(endLon, rOut);
    const p3 = toSvgCoords(endLon, rIn);
    const p4 = toSvgCoords(startLon, rIn);

    const span = ((endLon - startLon) % 360.0 + 360.0) % 360.0;
    const largeArc = span > 180.0 ? 1 : 0;

    return [
      `M ${p1.x} ${p1.y}`,
      `A ${rOut} ${rOut} 0 ${largeArc} 0 ${p2.x} ${p2.y}`,
      `L ${p3.x} ${p3.y}`,
      `A ${rIn} ${rIn} 0 ${largeArc} 1 ${p4.x} ${p4.y}`,
      'Z',
    ].join(' ');
  };

  // Radial Staggering for conjunct planets to prevent glyph overlap
  const visiblePlanets = chart.planets.filter((p) => p.name !== 'Mean Node');
  const sortedPlanets = [...visiblePlanets].sort((a, b) => a.longitude - b.longitude);

  const planetRadii: Record<string, number> = {};
  const basePlanetRadius = (rZodiacInner + rHousesInner) / 2;

  for (let i = 0; i < sortedPlanets.length; i++) {
    const curr = sortedPlanets[i];
    const prev = sortedPlanets[(i - 1 + sortedPlanets.length) % sortedPlanets.length];

    let diff = Math.abs(curr.longitude - prev.longitude);
    if (diff > 180) diff = 360 - diff;

    if (diff < 8.0) {
      const prevRadius = planetRadii[prev.name] || basePlanetRadius;
      planetRadii[curr.name] = prevRadius === basePlanetRadius ? basePlanetRadius - 15 : basePlanetRadius;
    } else {
      planetRadii[curr.name] = basePlanetRadius;
    }
  }

  const activePlanet = hoveredPlanet || chart.planets.find((p) => p.name === selectedPlanet);
  const activeHouseNum = hoveredHouse ?? selectedHouse;
  const activeHouseData = activeHouseNum ? chart.houses.find((h) => h.house === activeHouseNum) : null;
  const planetsInActiveHouse = activeHouseData ? chart.planets.filter((p) => p.house === activeHouseData.house) : [];

  const handleReset = () => {
    onSelectPlanet(null);
    setSelectedHouse(null);
    setHoveredPlanet(null);
    setHoveredHouse(null);
    setAspectFilter('all');
  };

  return (
    <div className="flex flex-col items-center bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xl dark:shadow-2xl relative w-full transition-colors duration-250">
      {/* Header Info & Title */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-1 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              วงล้อดวงชะตากำเนิด Placidus Natal Wheel
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">ระบบเรือนชะตา Placidus แบบ AstroDienst</span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentTheme(isDark ? 'light' : 'dark')}
            className="px-2 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            title="สลับโหมดสีวงล้อ (สว่าง / มืด)"
          >
            <span>{isDark ? '☀️ สว่าง' : '🌙 มืด'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDegrees(!showDegrees)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
              showDegrees
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="เปิด/ปิดการแสดงตัวเลของศาบนดวงดาว"
          >
            {showDegrees ? <Eye className="w-3.5 h-3.5 text-amber-500" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>องศาดาว</span>
          </button>

          {(selectedPlanet || selectedHouse || aspectFilter !== 'all') && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตมุมมอง</span>
            </button>
          )}
        </div>
      </div>

      {/* Aspect Filter Selector Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-1 py-1.5 mb-2 bg-slate-100/90 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800/80 rounded-xl text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 pl-2">
          <Filter className="w-3.5 h-3.5 text-sky-500" />
          <span className="text-[11px] font-medium">กรองเส้นมุมสัมพันธ์:</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAspectFilter('all')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              aspectFilter === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            onClick={() => setAspectFilter('harmonious')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              aspectFilter === 'harmonious'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            เกื้อหนุน (120° / 60°)
          </button>
          <button
            type="button"
            onClick={() => setAspectFilter('challenging')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              aspectFilter === 'challenging'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            ท้าทาย (90° / 180°)
          </button>
          <button
            type="button"
            onClick={() => setAspectFilter('none')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              aspectFilter === 'none'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            ปิดเส้นมุม
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full max-w-[620px] aspect-square flex items-center justify-center my-1">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="sj-chart-wheel-svg sj-chart-svg w-full h-full select-none drop-shadow-xl dark:drop-shadow-2xl overflow-visible"
          style={{ width: "100%", height: "100%", maxWidth: "620px", maxHeight: "620px", display: "block" }}
        >
          <defs>
            <radialGradient id="centerWheelGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isDark ? '#0b1120' : '#f8fafc'} stopOpacity="0.95" />
              <stop offset="70%" stopColor={isDark ? '#080c18' : '#f1f5f9'} stopOpacity="0.98" />
              <stop offset="100%" stopColor={isDark ? '#04060d' : '#e2e8f0'} stopOpacity="1" />
            </radialGradient>
            <filter id="planetGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Concentric Discs */}
          <circle cx={cx} cy={cy} r={rOuter} fill={isDark ? '#0b1120' : '#f8fafc'} stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="2" />
          <circle cx={cx} cy={cy} r={rZodiacInner} fill={isDark ? '#0f172a' : '#ffffff'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={rHousesInner} fill="url(#centerWheelGlow)" stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1" />
          <circle cx={cx} cy={cy} r={rAspects} fill={isDark ? '#050811' : '#ffffff'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1" />

          {/* 12 Zodiac Sign Segments with colored fill and vector glyphs */}
          {ZODIAC_SYMBOLS.map((z, idx) => {
            const startLon = idx * 30.0;
            const endLon = (idx + 1) * 30.0;
            const midLon = startLon + 15.0;

            const p1 = toSvgCoords(startLon, rOuter);
            const p2 = toSvgCoords(startLon, rZodiacInner);
            const pMid = toSvgCoords(midLon, (rOuter + rZodiacInner) / 2);

            return (
              <g key={z.name}>
                {/* Colored sector arc with proper concentric geometry */}
                <path
                  d={describeArc(startLon, endLon, rZodiacInner, rOuter)}
                  fill={isDark ? z.bg : z.lightBg}
                  className="transition-opacity hover:opacity-85 cursor-pointer"
                />

                {/* Boundary line between signs */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                  strokeWidth="1.5"
                />

                {/* Sign Symbol using Vector ZodiacIcon */}
                <ZodiacIcon
                  sign={z.name}
                  x={pMid.x - 11}
                  y={pMid.y - 11}
                  size={22}
                  color={isDark ? z.color : z.lightColor}
                />
              </g>
            );
          })}

          {/* Active House Sector Glow Highlight */}
          {activeHouseData && (() => {
            const hIndex = activeHouseData.house - 1;
            const startLon = activeHouseData.longitude;
            const nextLon = chart.houses[(hIndex + 1) % 12].longitude;
            return (
              <path
                d={describeArc(startLon, nextLon, rAspects, rZodiacInner)}
                fill="rgba(56, 189, 248, 0.12)"
                stroke="#38bdf8"
                strokeWidth="1"
                className="animate-in fade-in duration-200 pointer-events-none"
              />
            );
          })()}

          {/* Placidus House Cusps Lines and Prominent Badges */}
          {chart.houses.map((h) => {
            const pInner = toSvgCoords(h.longitude, rAspects);
            const pOuter = toSvgCoords(h.longitude, rZodiacInner);

            const isAxis = [1, 4, 7, 10].includes(h.house);
            const isHouseActive = activeHouseNum === h.house;
            const lineColor = isHouseActive ? '#0284c7' : isAxis ? '#0284c7' : isDark ? '#334155' : '#cbd5e1';
            const strokeW = isHouseActive ? 3 : isAxis ? 2.5 : 1;

            // House number label placed halfway in house band
            const nextHouseLon = chart.houses[h.house % 12].longitude;
            let midHouseLon = (h.longitude + nextHouseLon) / 2.0;
            if (nextHouseLon < h.longitude) {
              midHouseLon = ((h.longitude + nextHouseLon + 360.0) / 2.0) % 360.0;
            }
            const labelPos = toSvgCoords(midHouseLon, (rHousesInner + rAspects) / 2);

            return (
              <g key={`house-${h.house}`}>
                {/* Radial cusp boundary line */}
                <line
                  x1={pInner.x}
                  y1={pInner.y}
                  x2={pOuter.x}
                  y2={pOuter.y}
                  stroke={lineColor}
                  strokeWidth={strokeW}
                  strokeDasharray={isAxis || isHouseActive ? undefined : '2,2'}
                  className="transition-all"
                />

                {/* Interactive House Number Pill / Badge */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedHouse(selectedHouse === h.house ? null : h.house)}
                  onMouseEnter={() => setHoveredHouse(h.house)}
                  onMouseLeave={() => setHoveredHouse(null)}
                >
                  <circle
                    cx={labelPos.x}
                    cy={labelPos.y}
                    r="11"
                    fill={
                      isHouseActive
                        ? '#0284c7'
                        : isAxis
                        ? isDark
                          ? 'rgba(56, 189, 248, 0.22)'
                          : 'rgba(2, 132, 199, 0.15)'
                        : isDark
                        ? 'rgba(30, 41, 59, 0.85)'
                        : '#ffffff'
                    }
                    stroke={isHouseActive ? '#38bdf8' : isAxis ? '#0284c7' : isDark ? '#475569' : '#cbd5e1'}
                    strokeWidth={isHouseActive ? '2' : isAxis ? '1.5' : '1'}
                    className="transition-all shadow-sm"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 3.5}
                    textAnchor="middle"
                    fill={isHouseActive ? '#ffffff' : isAxis ? (isDark ? '#7dd3fc' : '#0369a1') : isDark ? '#94a3b8' : '#475569'}
                    fontSize="10"
                    fontWeight="bold"
                    className="select-none pointer-events-none font-mono"
                  >
                    {h.house}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Major Axes Arrows & Labels: AC, DC, MC, IC */}
          {(() => {
            const acPos = toSvgCoords(ascDeg, rOuter + 16);
            const dcPos = toSvgCoords((ascDeg + 180) % 360, rOuter + 16);
            const mcPos = toSvgCoords(chart.angles.Midheaven.longitude, rOuter + 16);
            const icPos = toSvgCoords(chart.angles.ImumCoeli.longitude, rOuter + 16);

            return (
              <g fontWeight="bold" fill={isDark ? '#38bdf8' : '#0284c7'} stroke="none">
                {/* Horizontal Horizon line (AC - DC) */}
                <line
                  x1={toSvgCoords(ascDeg, rOuter).x}
                  y1={toSvgCoords(ascDeg, rOuter).y}
                  x2={toSvgCoords((ascDeg + 180) % 360, rOuter).x}
                  y2={toSvgCoords((ascDeg + 180) % 360, rOuter).y}
                  stroke="#0284c7"
                  strokeWidth="2"
                  opacity="0.85"
                />

                {/* Vertical Meridian line (MC - IC) */}
                <line
                  x1={toSvgCoords(chart.angles.Midheaven.longitude, rOuter).x}
                  y1={toSvgCoords(chart.angles.Midheaven.longitude, rOuter).y}
                  x2={toSvgCoords(chart.angles.ImumCoeli.longitude, rOuter).x}
                  y2={toSvgCoords(chart.angles.ImumCoeli.longitude, rOuter).y}
                  stroke="#0284c7"
                  strokeWidth="2"
                  opacity="0.85"
                />

                {/* Text Labels with degrees */}
                <text x={acPos.x} y={acPos.y + 4} textAnchor="end" fontSize="12">
                  AC {chart.angles.Ascendant.degrees}°{chart.angles.Ascendant.minutes}'
                </text>
                <text x={dcPos.x} y={dcPos.y + 4} textAnchor="start" fontSize="12">
                  DC {chart.angles.Descendant.degrees}°{chart.angles.Descendant.minutes}'
                </text>
                <text x={mcPos.x} y={mcPos.y - 4} textAnchor="middle" fontSize="12">
                  MC {chart.angles.Midheaven.degrees}°{chart.angles.Midheaven.minutes}'
                </text>
                <text x={icPos.x} y={icPos.y + 14} textAnchor="middle" fontSize="12">
                  IC {chart.angles.ImumCoeli.degrees}°{chart.angles.ImumCoeli.minutes}'
                </text>
              </g>
            );
          })()}

          {/* Aspect Lines in Center (Connecting Planets) */}
          {aspectFilter !== 'none' && chart.aspects.map((asp, idx) => {
            const p1 = chart.planets_dict[asp.body1];
            const p2 = chart.planets_dict[asp.body2];
            if (!p1 || !p2) return null;

            const isMajorHarmony = ['Trine', 'Sextile'].includes(asp.aspect_name);
            const isHard = ['Square', 'Opposition'].includes(asp.aspect_name);

            if (aspectFilter === 'harmonious' && !isMajorHarmony) return null;
            if (aspectFilter === 'challenging' && !isHard) return null;

            const c1 = toSvgCoords(p1.longitude, rAspects - 6);
            const c2 = toSvgCoords(p2.longitude, rAspects - 6);

            const isHighlighted =
              (selectedPlanet && (asp.body1 === selectedPlanet || asp.body2 === selectedPlanet)) ||
              (hoveredPlanet && (asp.body1 === hoveredPlanet.name || asp.body2 === hoveredPlanet.name));

            let strokeColor = isMajorHarmony ? '#3b82f6' : isHard ? '#f43f5e' : '#10b981';
            let strokeWidth = isHighlighted ? 2.5 : isMajorHarmony || isHard ? 1.0 : 0.6;
            let strokeOpacity = isHighlighted ? 1.0 : selectedPlanet ? 0.12 : isDark ? 0.45 : 0.55;

            return (
              <line
                key={`asp-${idx}`}
                x1={c1.x}
                y1={c1.y}
                x2={c2.x}
                y2={c2.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeDasharray={asp.aspect_name === 'Opposition' ? '4,3' : undefined}
              />
            );
          })}

          {/* Planet Glyphs & Position Markers (With Radial Staggering) */}
          {visiblePlanets.map((planet) => {
            const pRadius = planetRadii[planet.name] || basePlanetRadius;
            const pGlyph = toSvgCoords(planet.longitude, pRadius);
            const isSelected = selectedPlanet === planet.name;
            const isHovered = hoveredPlanet?.name === planet.name;

            return (
              <g
                key={planet.name}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredPlanet(planet)}
                onMouseLeave={() => setHoveredPlanet(null)}
                onClick={() => onSelectPlanet(isSelected ? null : planet.name)}
              >
                {/* Glow ring if selected/hovered */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={pGlyph.x}
                    cy={pGlyph.y}
                    r="16"
                    fill="#f59e0b"
                    fillOpacity="0.3"
                    filter="url(#planetGlow)"
                  />
                )}

                {/* Planet Glyph Circle */}
                <circle
                  cx={pGlyph.x}
                  cy={pGlyph.y}
                  r="11"
                  fill={isSelected ? '#f59e0b' : isDark ? '#1e293b' : '#ffffff'}
                  stroke={isSelected ? '#d97706' : isDark ? '#475569' : '#cbd5e1'}
                  strokeWidth="1.5"
                  className="shadow-sm"
                />

                {/* Glyph Icon */}
                <text
                  x={pGlyph.x}
                  y={pGlyph.y + 4.5}
                  textAnchor="middle"
                  fill={isSelected ? (isDark ? '#0f172a' : '#ffffff') : isDark ? '#f8fafc' : '#0f172a'}
                  fontSize="13"
                  fontWeight="bold"
                >
                  {planet.symbol}
                </text>

                {/* Exact Degree Tag (Toggleable - alternates above/below for staggered planets) */}
                {showDegrees && (
                  <text
                    x={pGlyph.x}
                    y={pRadius < basePlanetRadius ? pGlyph.y - 15 : pGlyph.y + 19}
                    textAnchor="middle"
                    fill={isDark ? '#94a3b8' : '#64748b'}
                    fontSize="9"
                    fontWeight="600"
                    className="font-mono select-none"
                  >
                    {planet.degrees}°{planet.minutes}'
                    {planet.is_retrograde && <tspan fill="#f43f5e" fontWeight="bold"> r</tspan>}
                  </text>
                )}
              </g>
            );
          })}

          {/* Central Logo Disk */}
          <circle cx={cx} cy={cy} r={32} fill={isDark ? '#080c18' : '#ffffff'} stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1.5" />
          <text x={cx} y={cy - 2} textAnchor="middle" fill={isDark ? '#f59e0b' : '#d97706'} fontSize="9" fontWeight="bold" letterSpacing="1">
            SOLARIAN
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#64748b" fontSize="7.5" fontWeight="500">
            PLACIDUS
          </text>
        </svg>
      </div>

      {/* Active House Tooltip / Quick Card */}
      {activeHouseData && (
        <div className="w-full mt-2 p-3 bg-slate-50/95 dark:bg-slate-950/85 border border-sky-500/30 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150 shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center text-xs">
              {activeHouseData.house}
            </span>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">เรือนที่ {activeHouseData.house}: {activeHouseData.name_thai}</span>
              <span className="text-slate-500 dark:text-slate-400 ml-2 font-mono">({activeHouseData.sign_thai} {activeHouseData.formatted_dms.split(' ')[1]})</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">ดาวสถิต:</span>
            {planetsInActiveHouse.length > 0 ? (
              planetsInActiveHouse.map((p) => (
                <span key={p.name} className="bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-mono text-[11px] flex items-center gap-1 shadow-sm">
                  <span>{p.symbol}</span>
                  <span>{p.thai} ({p.degrees}°{p.minutes}')</span>
                </span>
              ))
            ) : (
              <span className="text-slate-400 dark:text-slate-500 italic">ไม่มีดาวสถิต (เรือนว่าง)</span>
            )}
          </div>
        </div>
      )}

      {/* Active Planet Floating Tag */}
      {activePlanet && !activeHouseData && (
        <div className="w-full mt-2 p-2.5 bg-slate-50/95 dark:bg-slate-950/80 border border-amber-500/30 rounded-xl text-xs flex items-center justify-between gap-2 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold text-base">{activePlanet.symbol}</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">ดาว{activePlanet.thai} ({activePlanet.name})</span>
            <span className="font-mono text-amber-600 dark:text-amber-300">
              {activePlanet.sign_thai} {activePlanet.degrees}°{activePlanet.minutes}'{activePlanet.seconds}"
            </span>
          </div>
          <span className="bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold">
            สถิตเรือนที่ {activePlanet.house}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="w-full flex flex-wrap items-center justify-center gap-5 mt-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-blue-500 rounded" />
          <span>ตรีโกณ/โยค (120° / 60°)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-rose-500 rounded" />
          <span>ฉาก/เล็ง (90° / 180°)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>คลิกที่ดาวเพื่อไฮไลท์มุม</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full border border-sky-500 text-[10px] text-sky-600 dark:text-sky-300 flex items-center justify-center font-bold">1</span>
          <span>คลิกเลขเรือนเพื่อดูข้อมูลภพ</span>
        </div>
      </div>
    </div>
  );
};

