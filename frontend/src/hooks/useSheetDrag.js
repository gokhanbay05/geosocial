import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Sadece üstteki tutma çubuğundan (SheetDragHandle) tutularak
 * alttan çıkan panellerin aşağı sürüklenip kapatılmasını yöneten atomik hook.
 * İçerik kaydırma (scroll) alanlarından tamamen izoledir.
 */
export function useSheetDrag({ isOpen, onClose, threshold = 90 }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const activePointerIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setDragOffset(0);
      setIsDragging(false);
      currentOffsetRef.current = 0;
    }
  }, [isOpen]);

  const handlePointerDown = useCallback((e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    activePointerIdRef.current = e.pointerId;
    startYRef.current = e.clientY;
    startTimeRef.current = performance.now();
    currentOffsetRef.current = 0;
    setIsDragging(true);

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore pointer capture errors on synthetic events
      }
    }
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || activePointerIdRef.current !== e.pointerId) return;

      const deltaY = e.clientY - startYRef.current;
      // Sadece aşağı yönlü sürüklemeye izin ver (yukarı çekilirse sıfırda tut)
      const clampedOffset = Math.max(0, deltaY);

      currentOffsetRef.current = clampedOffset;
      setDragOffset(clampedOffset);
    },
    [isDragging]
  );

  const finishDrag = useCallback(
    (e) => {
      if (!isDragging || activePointerIdRef.current !== e.pointerId) return;

      if (e.currentTarget?.releasePointerCapture) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore release errors
        }
      }

      const elapsed = Math.max(1, performance.now() - startTimeRef.current);
      const velocity = currentOffsetRef.current / elapsed; // px/ms
      const shouldClose =
        currentOffsetRef.current > threshold ||
        (currentOffsetRef.current > 35 && velocity > 0.55);

      activePointerIdRef.current = null;
      currentOffsetRef.current = 0;
      setIsDragging(false);
      setDragOffset(0);

      if (shouldClose && onClose) {
        onClose();
      }
    },
    [isDragging, onClose, threshold]
  );

  const dragStyle =
    isDragging || dragOffset > 0
      ? {
          transform: `translate3d(0, ${dragOffset}px, 0)`,
          transition: isDragging ? "none" : undefined,
        }
      : undefined;

  const handleProps = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: finishDrag,
    onPointerCancel: finishDrag,
  };

  return {
    dragStyle,
    isDragging,
    handleProps,
  };
}
