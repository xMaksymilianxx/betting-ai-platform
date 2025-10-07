import * as React from "react";

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className = "" }: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className={`w-full bg-slate-700 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
