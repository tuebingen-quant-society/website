import { encodeQr, qrPathData } from "@/lib/qr";

type QrCodeProps = {
  /** Payload encoded into the code — for us always a URL. */
  value: string;
  /** Describes the target for screen readers; the code itself is decorative to them. */
  label: string;
  className?: string;
};

/** Modules of quiet zone; four is the minimum the spec asks for. */
const MARGIN = 4;

/**
 * Renders a QR code as inline SVG, generated on the server from `value`.
 *
 * Colours are fixed rather than themed: a code inverted by dark mode is not
 * reliably scannable, so the light quiet zone is painted explicitly.
 */
export function QrCode({ value, label, className }: QrCodeProps) {
  const matrix = encodeQr(value);
  const extent = matrix.size + MARGIN * 2;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${extent} ${extent}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <rect width={extent} height={extent} fill="#ffffff" />
      <path d={qrPathData(matrix, MARGIN)} fill="#0d0d10" />
    </svg>
  );
}
