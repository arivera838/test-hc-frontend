import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 bg-white border ${
          error ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
        } rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${className}`}
        {...props}
      />
    );
  }
);
