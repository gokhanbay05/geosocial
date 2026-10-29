import { useState, useRef, useCallback, useEffect } from "react";

let lastSheetCloseTime = 0;

export const getLastSheetCloseTime = () => lastSheetCloseTime;

/**
 * Sadece üstteki çentikten (SheetDragHandle) tutularak veya dokunularak
 * alttan çıkan panellerin aşağı sürüklenip kapatılmasını yöneten atomik hook.
 * İçerik kaydırma (scroll) alanlarından tamamen izoledir.
 */
export function useSheetDrag({ isOpen, onClose, threshold = 80 }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const maxMovementRef = useRef(0);
  const activePointerIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setDragOffset(0);
      setIsDragging(false);
      currentOffsetRef.current = 0;
      maxMovementRef.current = 0;
    }
  }, [isOpen]);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    if (e.pointerType === "mouse" && e.button !== 0) return;

    lastSheetCloseTime = Date.now();
    activePointerIdRef.current = e.pointerId;
    startYRef.current = e.clientY;
    startTimeRef.current = performance.now();
    currentOffsetRef.current = 0;
    maxMovementRef.current = 0;
    setIsDragging(true);

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore pointer capture errors
      }
    }
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || activePointerIdRef.current !== e.pointerId) return;
      e.stopPropagation();

      const deltaY = e.clientY - startYRef.current;
      maxMovementRef.current = Math.max(
        maxMovementRef.current,
        Math.abs(deltaY)
      );

      const clampedOffset = Math.max(0, deltaY);
      currentOffsetRef.current = clampedOffset;
      setDragOffset(clampedOffset);
    },
    [isDragging]
  );

  const finishDrag = useCallback(
    (e) => {
      if (!isDragging || activePointerIdRef.current !== e.pointerId) return;
      e.stopPropagation();

      if (e.currentTarget?.releasePointerCapture) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore release errors
        }
      }

      const elapsed = Math.max(1, performance.now() - startTimeRef.current);
      const velocity = currentOffsetRef.current / elapsed;
      const isTap = maxMovementRef.current < 8 && elapsed < 350;
      const shouldClose =
        isTap ||
        currentOffsetRef.current > threshold ||
        (currentOffsetRef.current > 30 && velocity > 0.5);

      activePointerIdRef.current = null;
      currentOffsetRef.current = 0;
      maxMovementRef.current = 0;
      setIsDragging(false);
      setDragOffset(0);
      lastSheetCloseTime = Date.now();

      if (shouldClose && onClose) {
        onClose();
      }
    },
    [isDragging, onClose, threshold]
  );

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    lastSheetCloseTime = Date.now();
  }, []);

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
    onClick: handleClick,
  };

  return {
    dragStyle,
    isDragging,
    handleProps,
  };
}
