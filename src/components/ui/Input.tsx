import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    label,
    error,
    hint,
    prefix,
    suffix,
    inputSize = 'md',
    type = 'text',
    id,
    ...props 
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    const sizes = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-4 py-3',
    };
    
    const wrapperSizes = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {prefix && (
            <div className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400",
              wrapperSizes[inputSize]
            )}>
              {prefix}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "w-full rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors",
              sizes[inputSize],
              error 
                ? "border-red-500 dark:border-red-400 focus:ring-red-500" 
                : "border-gray-300 dark:border-gray-600",
              prefix && "pl-10",
              suffix && "pr-10",
              className
            )}
            {...props}
          />
          
          {suffix && (
            <div className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400",
              wrapperSizes[inputSize]
            )}>
              {suffix}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;