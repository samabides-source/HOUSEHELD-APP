"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

/**
 * Löschen mit Zwei-Klick-Bestätigung (PRD 5.6). Der zweite Klick muss innerhalb
 * von 5 Sekunden erfolgen, danach fällt der Button in den Ausgangszustand
 * zurück.
 */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  size = "sm",
  className,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleClick = () => {
    if (armed) {
      if (timer.current) clearTimeout(timer.current);
      setArmed(false);
      onConfirm();
      return;
    }
    setArmed(true);
    timer.current = setTimeout(() => setArmed(false), 5000);
  };

  return (
    <Button
      type="button"
      size={size}
      variant={armed ? "danger" : "ghost"}
      onClick={handleClick}
      className={className}
    >
      {armed ? confirmLabel : label}
    </Button>
  );
}
