import React from 'react';

interface ZodiacIconProps {
  sign: string; // 'Aries', 'Taurus', etc., or Thai name e.g. 'เมษ', or index 0-11
  className?: string;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
}

export const ZodiacIcon: React.FC<ZodiacIconProps> = ({
  sign,
  className = '',
  size = 20,
  color = 'currentColor',
  x,
  y,
}) => {
  const norm = sign.toLowerCase().trim();

  // Normalize sign name or Thai name to key
  let key = 'aries';
  if (norm.includes('aries') || norm.includes('เมษ') || norm === '0') key = 'aries';
  else if (norm.includes('taur') || norm.includes('พฤษภ') || norm === '1') key = 'taurus';
  else if (norm.includes('gemin') || norm.includes('เมถุน') || norm === '2') key = 'gemini';
  else if (norm.includes('canc') || norm.includes('กรกฎ') || norm === '3') key = 'cancer';
  else if (norm.includes('leo') || norm.includes('สิงห์') || norm === '4') key = 'leo';
  else if (norm.includes('virg') || norm.includes('กันย์') || norm === '5') key = 'virgo';
  else if (norm.includes('libr') || norm.includes('ตุลย์') || norm === '6') key = 'libra';
  else if (norm.includes('scorp') || norm.includes('พิจิก') || norm === '7') key = 'scorpio';
  else if (norm.includes('sagitt') || norm.includes('ธนู') || norm === '8') key = 'sagittarius';
  else if (norm.includes('capri') || norm.includes('มังกร') || norm === '9') key = 'capricorn';
  else if (norm.includes('aquar') || norm.includes('กุมภ์') || norm === '10') key = 'aquarius';
  else if (norm.includes('pisc') || norm.includes('มีน') || norm === '11') key = 'pisces';

  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
      className={`sj-zodiac-icon inline-block shrink-0 select-none ${className}`}
    >
      {key === 'aries' && (
        <path d="M12 21V9m0 0C10.5 5.5 7 5 4.5 7.5S4 12 6.5 12m5.5-3c1.5-3.5 5-4 7.5-1.5s.5 4.5-2 4.5" />
      )}
      {key === 'taurus' && (
        <>
          <circle cx="12" cy="14" r="6" />
          <path d="M5 4c1 4 4 6 7 6s6-2 7-6" />
        </>
      )}
      {key === 'gemini' && (
        <>
          <path d="M4 4c5 2 11 2 16 0M4 20c5-2 11-2 16 0" />
          <path d="M8 5v14M16 5v14" />
        </>
      )}
      {key === 'cancer' && (
        <>
          <circle cx="7" cy="9" r="3.5" />
          <path d="M7 5.5C12 5.5 18 8 18 13" />
          <circle cx="17" cy="15" r="3.5" />
          <path d="M17 18.5C12 18.5 6 16 6 11" />
        </>
      )}
      {key === 'leo' && (
        <path d="M6 16a3 3 0 1 1 5-2.2c1-2.5 3-7.8 6-7.8a3 3 0 0 1 3 3c0 4.5-4 9-4 9" />
      )}
      {key === 'virgo' && (
        <path d="M4 5v11a2.5 2.5 0 0 0 5 0V5a2.5 2.5 0 0 1 5 0v11a2.5 2.5 0 0 0 5 0V8c0-2-2-3-4-1.5l3 12.5a2.5 2.5 0 0 1-5 0" />
      )}
      {key === 'libra' && (
        <>
          <path d="M3 19h18M3 15h5a4 4 0 1 1 8 0h5" />
        </>
      )}
      {key === 'scorpio' && (
        <path d="M4 5v11a2.5 2.5 0 0 0 5 0V5a2.5 2.5 0 0 1 5 0v11a2.5 2.5 0 0 0 4.5 1.5L21 16m-3 4 3-4-4-.5" />
      )}
      {key === 'sagittarius' && (
        <>
          <path d="M6 18l13-13m0 0h-7m7 0v7" />
          <path d="M8 11l5 5" />
        </>
      )}
      {key === 'capricorn' && (
        <path d="M4 6l5 12 4-9c1-2 4-2 4 1v5a3 3 0 1 1-3 3" />
      )}
      {key === 'aquarius' && (
        <>
          <path d="M3 8l3.5-3 4 3 4-3 4 3 2.5-2" />
          <path d="M3 16l3.5-3 4 3 4-3 4 3 2.5-2" />
        </>
      )}
      {key === 'pisces' && (
        <>
          <path d="M5 4c3 5 3 11 0 16" />
          <path d="M19 4c-3 5-3 11 0 16" />
          <path d="M3 12h18" />
        </>
      )}
    </svg>
  );
};
