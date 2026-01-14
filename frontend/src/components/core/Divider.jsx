import React from "react";
import { cn } from "@/lib/utils";
import "../../css/core/Divider.css";

/**
 * @param {'horizontal' | 'vertical'} orientation
 * @param {string} text
 */
export default function Divider({
  orientation = "horizontal",
  text,
  className,
}) {
  if (text && orientation === "horizontal") {
    return (
      <div className={cn("divider-with-text", className)}>
        <span className="divider-line" />
        <span className="divider-text">{text}</span>
        <span className="divider-line" />
      </div>
    );
  }

  return <div className={cn("divider", `divider-${orientation}`, className)} />;
}
