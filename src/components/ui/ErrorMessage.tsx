import { cn } from '@/lib/cn';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export interface ErrorMessageProps {
  message?: string | null;
  className?: string;
  showIcon?: boolean;
}

export default function ErrorMessage({ 
  message, 
  className,
  showIcon = true 
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div 
      className={cn(
        'flex items-start space-x-2 text-sm text-red-600 dark:text-red-400',
        'animate-in fade-in-0 slide-in-from-top-1 duration-200',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {showIcon && (
        <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
}

// Convenience component for form field errors
export function FieldError({ 
  error,
  className 
}: { 
  error?: { message?: string } | string;
  className?: string;
}) {
  const message = typeof error === 'string' ? error : error?.message;
  
  return (
    <ErrorMessage 
      message={message} 
      showIcon={false}
      className={cn('mt-1', className)}
    />
  );
}