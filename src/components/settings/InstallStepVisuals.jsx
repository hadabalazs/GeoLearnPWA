// SVG illustrations for each install-guide step. 56×56px, matching the spec.

function SafariVisual() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="24" fill="#007AFF" opacity="0.12" />
      <circle cx="28" cy="28" r="20" stroke="#007AFF" strokeWidth="2.5" fill="none" />
      <path d="M28 14 L31 25 L28 28 L25 25 Z" fill="#007AFF" />
      <path d="M28 42 L25 31 L28 28 L31 31 Z" fill="#007AFF" opacity="0.4" />
      <circle cx="28" cy="28" r="2.5" fill="#007AFF" />
    </svg>
  );
}

function ShareVisual() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <rect width="56" height="56" rx="14" fill="#007AFF" opacity="0.12" />
      <rect x="20" y="28" width="16" height="14" rx="2" stroke="#007AFF" strokeWidth="2.5" fill="none" />
      <path d="M28 14 L28 30 M22 20 L28 14 L34 20" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function AddHomeVisual() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <rect width="56" height="56" rx="14" fill="#007AFF" opacity="0.12" />
      <rect x="16" y="16" width="24" height="24" rx="5" stroke="#007AFF" strokeWidth="2.5" fill="none" />
      <path d="M28 22 L28 34 M22 28 L34 28" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckVisual() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="24" fill="#33C759" opacity="0.15" />
      <circle cx="28" cy="28" r="20" stroke="#33C759" strokeWidth="2.5" fill="none" />
      <path d="M18 28 L25 35 L38 20" stroke="#33C759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ChromeVisual() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="24" fill="#4285F4" opacity="0.12" />
      <circle cx="28" cy="28" r="10" stroke="#4285F4" strokeWidth="3" fill="none" />
      <circle cx="28" cy="28" r="4" fill="#4285F4" />
      <path d="M28 18 L40 28 M28 18 L16 28" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function DotsVisual() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <rect width="56" height="56" rx="14" fill="#34A853" opacity="0.12" />
      <circle cx="28" cy="20" r="3" fill="#34A853" />
      <circle cx="28" cy="28" r="3" fill="#34A853" />
      <circle cx="28" cy="36" r="3" fill="#34A853" />
    </svg>
  );
}

const VISUALS = {
  safari: SafariVisual,
  share: ShareVisual,
  addHome: AddHomeVisual,
  check: CheckVisual,
  chrome: ChromeVisual,
  dots: DotsVisual,
};

export default function StepVisual({ name }) {
  const Cmp = VISUALS[name];
  return Cmp ? <Cmp /> : null;
}