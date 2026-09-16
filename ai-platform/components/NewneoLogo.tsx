'use client';
import { useId } from 'react';

// Original N geometry and gradients from Hybrid v4 Make's NMark component.
export function NewneoMark({ size = 32 }: { size?: number }) {
  const uid = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Left bar: white → silver */}
        <linearGradient id={`${uid}-L`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#8BACC8" />
        </linearGradient>

        {/* Diagonal main face: silver → blue */}
        <linearGradient id={`${uid}-D`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C5D8EA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* Diagonal shadow strip: dark fold on left edge */}
        <linearGradient id={`${uid}-S`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0B1525" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0B1525" stopOpacity="0" />
        </linearGradient>

        {/* Right bar: cyan → deep blue */}
        <linearGradient id={`${uid}-R`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      {/* Left vertical bar */}
      <rect
        x="2"
        y="2"
        width="9"
        height="42"
        rx="1.5"
        fill={`url(#${uid}-L)`}
      />

      {/* Diagonal — main face */}
      <polygon points="11,2 20,2 30,44 21,44" fill={`url(#${uid}-D)`} />

      {/* Diagonal — shadow fold on left edge */}
      <polygon points="11,2 15,2 23,44 21,44" fill={`url(#${uid}-S)`} />

      {/* Right vertical bar */}
      <rect
        x="29"
        y="2"
        width="9"
        height="42"
        rx="1.5"
        fill={`url(#${uid}-R)`}
      />
    </svg>
  );
}

export function NewneoWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-label="NEWNEO"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 8 : 10,
        whiteSpace: 'nowrap',
      }}
    >
      <NewneoMark size={compact ? 28 : 32} />
      {!compact && (
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.03em',
          }}
        >
          <span style={{ color: '#E2E8F0' }}>NEW</span>
          <span style={{ color: '#38BDF8' }}>NEO</span>
        </span>
      )}
    </span>
  );
}
