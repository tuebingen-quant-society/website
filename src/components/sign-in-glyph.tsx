/**
 * Arrow stepping through a door — marks the two buttons that actually start the
 * university login, so a click is never a surprise. Deliberately not a padlock:
 * the first thing a visitor sees should read as an invitation, not as a barrier.
 */
export function SignInGlyph() {
  return (
    <svg
      className="glyph-signin"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.6 2.6h2.6a1.4 1.4 0 0 1 1.4 1.4v8a1.4 1.4 0 0 1-1.4 1.4H9.6" />
      <path d="M2.4 8h6.4" />
      <path d="M6.4 5.6 8.8 8l-2.4 2.4" />
    </svg>
  );
}
