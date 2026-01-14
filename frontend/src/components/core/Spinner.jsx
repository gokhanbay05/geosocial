import React from "react";
import { cn } from "@/lib/utils";
import "../../css/core/Spinner.css";

export const Spinner = ({ size = "md", color, className }) => {
  return (
    <div
      className={cn(
        "spinner",
        `spinner-${size}`,
        color && `spinner-${color}`,
        className
      )}
    />
  );
};

export default Spinner;
