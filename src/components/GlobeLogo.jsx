// Simple globe logo — a clean globe with latitude/longitude lines on a
// sky-blue rounded square.
export default function GlobeLogo({ size = 64 }) {
  return (
    <div className="rounded-2xl overflow-hidden shrink-0 grid place-items-center" style={{ width: size, height: size, background: '#74AEC7' }}>
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="20" fill="none" stroke="white" strokeWidth="2.5" />
        <ellipse cx="32" cy="32" rx="20" ry="8" fill="none" stroke="white" strokeWidth="1.5" opacity="0.85" />
        <ellipse cx="32" cy="32" rx="8" ry="20" fill="none" stroke="white" strokeWidth="1.5" opacity="0.85" />
        <line x1="12" y1="32" x2="52" y2="32" stroke="white" strokeWidth="1.5" opacity="0.85" />
      </svg>
    </div>
  );
}