import { ChevronDown, ChevronUp } from "lucide-react";
import "../../css/mobile/SheetDragHandle.css";

/**
 * Mobil ve tablet ekranlarda (< 1024px) alttan çıkan çekmecelerin
 * tam üst ortasında yer alan, sürüklenerek veya dokunularak açılıp kapatılmasını sağlayan çentik (notch).
 */
export default function SheetDragHandle({
  handleProps,
  direction = "down",
  className = "",
}) {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  const label =
    direction === "up"
      ? "Drag or tap to open panel"
      : "Drag or tap to close panel";

  return (
    <div className={`sheet-drag-handle-area ${className}`}>
      <div
        className="sheet-drag-notch"
        aria-label={label}
        role="button"
        tabIndex={0}
        {...handleProps}
      >
        <Icon size={18} strokeWidth={2.5} />
      </div>
    </div>
  );
}
