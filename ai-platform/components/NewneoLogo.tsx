// The official user-supplied artwork is preserved byte for byte.
// Crop its surrounding canvas in CSS, without redrawing the mark or lettering.
const artwork = '/assets/brand/newneo-official.png';

function OfficialArtwork({
  compact,
  size,
  wordOnly = false,
}: {
  compact: boolean;
  size: number;
  wordOnly?: boolean;
}) {
  const crop = compact
    ? { x: 252, y: 304, width: 296, height: 296 }
    : wordOnly
      ? { x: 608, y: 377, width: 842, height: 148 }
      : { x: 252, y: 304, width: 1200, height: 296 };
  const scale = size / crop.height;
  return (
    <span
      role="img"
      aria-label="NEWNEO"
      style={{
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        width: crop.width * scale,
        height: size,
        verticalAlign: 'middle',
        backgroundImage: `url("${artwork}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${1672 * scale}px ${941 * scale}px`,
        backgroundPosition: `${-crop.x * scale}px ${-crop.y * scale}px`,
      }}
    />
  );
}

export function NewneoMark({ size = 32 }: { size?: number }) {
  return <OfficialArtwork compact size={size} />;
}

export function NewneoWordmark({
  compact = false,
  sidebar = false,
}: {
  compact?: boolean;
  sidebar?: boolean;
}) {
  if (sidebar)
    return (
      <span
        style={{ display: 'inline-flex', alignItems: 'center', height: 36 }}
      >
        <OfficialArtwork compact={compact} wordOnly={!compact} size={18} />
      </span>
    );
  return <OfficialArtwork compact={compact} size={36} />;
}
