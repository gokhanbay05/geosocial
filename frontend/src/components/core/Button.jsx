import React from "react";
import { cn } from "@/lib/utils";
import "../../css/core/Button.css";

/**
 * @param {string} variant
 * @param {string} size
 */
export const Button = React.forwardRef(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "btn",
          `btn-${variant}`,
          size === "icon" ? "btn-icon" : `btn-${size}`,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
