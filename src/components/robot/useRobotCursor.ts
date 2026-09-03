import { useState, useEffect, useRef } from 'react';

interface CursorState {
  normX: number;
  normY: number;
  isNear: boolean;
  distance: number;
}

export const useRobotCursor = (targetScreenPos: { x: number; y: number }) => {
  const [cursorState, setCursorState] = useState<CursorState>({
    normX: 0,
    normY: 0,
    isNear: false,
    distance: 9999,
  });

  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;

      // Normalized coordinates (-1 to 1)
      const normX = (e.clientX / windowW) * 2 - 1;
      const normY = -(e.clientY / windowH) * 2 + 1;

      // Distance from robot center in pixel coordinates
      const deltaX = e.clientX - targetScreenPos.x;
      const deltaY = e.clientY - targetScreenPos.y;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Proximity threshold is 280px
      const currentlyNear = dist < 280;

      if (currentlyNear) {
        if (leaveTimeoutRef.current) {
          clearTimeout(leaveTimeoutRef.current);
          leaveTimeoutRef.current = null;
        }
        setCursorState({
          normX,
          normY,
          isNear: true,
          distance: dist,
        });
      } else {
        // Smooth delayed transition when cursor leaves
        if (!leaveTimeoutRef.current) {
          leaveTimeoutRef.current = setTimeout(() => {
            setCursorState((prev) => ({
              ...prev,
              isNear: false,
            }));
            leaveTimeoutRef.current = null;
          }, 500);
        }

        setCursorState((prev) => ({
          ...prev,
          normX,
          normY,
          distance: dist,
        }));
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, [targetScreenPos.x, targetScreenPos.y]);

  return cursorState;
};
