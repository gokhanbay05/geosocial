import { ChevronDown } from "lucide-react";
import "../../css/mobile/SheetDragHandle.css";

/**
 * Mobil ve tablet ekranlarda (< 1024px) alttan çıkan çekmecelerin
 * tam üst ortasında yer alan, sürüklenerek veya dokunularak kapatılmasını sağlayan çentik (notch).
 */
export default function SheetDragHandle({ handleProps, className = "" }) {
  return (
    <div className={`sheet-drag-handle-area ${className}`}>
      <div
        className="sheet-drag-notch"
        aria-label="Drag or tap to close panel"
        {...handleProps}
      >
        <ChevronDown size={20} strokeWidth={2.5} />
      </div>
    </div>
  );
}
