import { flagUrl } from '@/lib/data';

// `priority` = the flag is the question itself (above the fold): load eagerly.
// Options lists keep lazy loading. width/height attributes give the browser an
// intrinsic aspect ratio before the image arrives so the prompt doesn't jump;
// CSS classes (h-20 w-auto etc.) still control the rendered size.
export default function FlagImage({ flagCode, alt, className = '', size = 240, priority = false }) {
  if (!flagCode) return <div className={`bg-muted rounded ${className}`} />;
  return (
    <img
      src={flagUrl(flagCode, size)}
      alt={alt || `flag ${flagCode}`}
      width={size}
      height={Math.round(size * 2 / 3)}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={`object-contain ${className}`}
      style={{ maxWidth: '100%' }}
    />
  );
}
