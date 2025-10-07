import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

export function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
  const variantStyles = {
    default: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
    outline: "border border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500",
    ghost: "text-slate-300 hover:bg-slate-800 hover:text-white",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
