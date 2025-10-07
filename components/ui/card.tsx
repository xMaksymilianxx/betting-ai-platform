import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-slate-800/50 rounded-xl border border-slate-700 p-6 ${className}`}
      {...props}
    />
  );
}
