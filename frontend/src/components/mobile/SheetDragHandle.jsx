import "../../css/mobile/SheetDragHandle.css";

/**
 * Mobil ve tablet ekranlarda (< 1024px) alttan çıkan panellerin
 * en üstünde yer alan, sadece buradan tutularak sürüklenmesini sağlayan bar.
 */
export default function SheetDragHandle({ handleProps, className = "" }) {
  return (
    <div
      className={`sheet-drag-handle-area ${className}`}
      aria-label="Drag to close panel"
      {...handleProps}
    >
      <div className="sheet-drag-pill" />
    </div>
  );
}
