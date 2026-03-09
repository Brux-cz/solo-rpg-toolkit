import { useRef, useEffect, useCallback } from "react";
import { C, FONT } from "../../constants/theme.js";

const SNAP_THRESHOLD = 50;

export default function SwipeableBlock({ children, isOpen, onOpen, onClose, canReroll, onDelete, onReroll }) {
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const actionsRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentOffset = useRef(0);
  const locked = useRef(null);
  const REVEAL_WIDTH = canReroll ? 130 : 65;

  const showActions = useCallback((visible) => {
    if (actionsRef.current) {
      actionsRef.current.style.display = visible ? "flex" : "none";
    }
  }, []);

  const setOffset = useCallback((val, animate) => {
    currentOffset.current = val;
    if (sliderRef.current) {
      sliderRef.current.style.transition = animate ? "transform 0.25s ease-out" : "none";
      sliderRef.current.style.transform = `translateX(${val}px)`;
    }
  }, []);

  useEffect(() => {
    showActions(isOpen);
    setOffset(isOpen ? -REVEAL_WIDTH : 0, true);
  }, [isOpen, REVEAL_WIDTH, setOffset, showActions]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      locked.current = null;
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
    };

    const onTouchMove = (e) => {
      const touch = e.touches[0];
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;

      if (!locked.current) {
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          locked.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
          if (locked.current === "h") showActions(true);
        }
        return;
      }

      if (locked.current === "v") return;

      e.preventDefault();
      const base = isOpen ? -REVEAL_WIDTH : 0;
      let raw = base + dx;
      raw = Math.max(-REVEAL_WIDTH, Math.min(0, raw));
      setOffset(raw, false);
    };

    const onTouchEnd = () => {
      if (locked.current !== "h") return;
      const offset = currentOffset.current;
      if (isOpen) {
        if (offset > -REVEAL_WIDTH + SNAP_THRESHOLD) {
          onClose();
        } else {
          setOffset(-REVEAL_WIDTH, true);
        }
      } else {
        if (offset < -SNAP_THRESHOLD) {
          onOpen();
        } else {
          setOffset(0, true);
          setTimeout(() => { if (currentOffset.current === 0) showActions(false); }, 260);
        }
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [isOpen, REVEAL_WIDTH, onOpen, onClose, setOffset, showActions]);

  const btnStyle = {
    border: "none",
    color: "white",
    fontFamily: FONT,
    fontSize: 10,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    width: 65,
    flexShrink: 0,
  };

  return (
    <div ref={containerRef} style={{ overflow: "hidden", margin: "6px 0" }}>
      {/* Flex row: content + actions slide together */}
      <div ref={sliderRef} style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{ flex: "0 0 100%", background: C.bg }}>
          {children}
        </div>
        <div ref={actionsRef} style={{ display: isOpen ? "flex" : "none", flexShrink: 0 }}>
          {canReroll && (
            <button onClick={onReroll} style={{ ...btnStyle, background: C.blue }}>
              Přehodit
            </button>
          )}
          <button onClick={onDelete} style={{ ...btnStyle, background: C.red }}>
            Smazat
          </button>
        </div>
      </div>
    </div>
  );
}
