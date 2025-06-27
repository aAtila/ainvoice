import { TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean;
}

export function Table({ children, striped = false, className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          "w-full text-sm text-left text-gray-700 dark:text-gray-300",
          striped && "[&_tbody_tr:nth-child(even)]:bg-gray-50 dark:[&_tbody_tr:nth-child(even)]:bg-gray-900/50",
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }: TableHTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }: TableHTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }: TableHTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "bg-white border-b dark:bg-gray-800 dark:border-gray-700",
        "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | false;
  onSort?: () => void;
}

export function TableHead({ 
  children, 
  sortable = false, 
  sorted = false,
  onSort,
  className, 
  ...props 
}: TableHeadProps) {
  return (
    <th
      scope="col"
      className={cn(
        "px-6 py-3",
        sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none",
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col">
            <svg
              className={cn(
                "w-3 h-3 -mb-1",
                sorted === 'asc' ? 'text-gray-900 dark:text-white' : 'text-gray-400'
              )}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7 14l5-5 5 5H7z" />
            </svg>
            <svg
              className={cn(
                "w-3 h-3 -mt-1",
                sorted === 'desc' ? 'text-gray-900 dark:text-white' : 'text-gray-400'
              )}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </div>
        )}
      </div>
    </th>
  );
}

export function TableCell({ children, className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-6 py-4",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableEmpty({ message = "No data available" }: { message?: string }) {
  return (
    <TableRow>
      <TableCell colSpan={100} className="text-center py-8 text-gray-500 dark:text-gray-400">
        {message}
      </TableCell>
    </TableRow>
  );
}