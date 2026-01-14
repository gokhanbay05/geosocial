import React from "react";
import { cn } from "@/lib/utils";
import "../../css/core/Input.css";

/**
 * @param {string} label
 * @param {string} error
 * @param {ReactNode} icon
 * @param {ReactNode} rightElement
 */
const Input = React.forwardRef(
  ({ className, type, label, error, icon, rightElement, ...props }, ref) => {
    return (
      <div className="input-container">
        {label && (
          <label className="text-sm font-medium text-text-dark">{label}</label>
        )}

        <div className="input-wrapper">
          {icon && <div className="input-icon-left">{icon}</div>}

          <input
            type={type}
            className={cn(
              "input-field",
              icon && "input-has-icon-left",
              rightElement && "input-has-right",
              error && "has-error",
              className
            )}
            ref={ref}
            {...props}
          />

          {rightElement && (
            <div className="input-right-element">{rightElement}</div>
          )}
        </div>

        {error && (
          <span className="text-xs text-danger-text font-medium">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
