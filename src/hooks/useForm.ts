'use client';

import { useForm as useHookForm, UseFormProps, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useState } from 'react';

export interface UseFormOptions<TFieldValues extends FieldValues = FieldValues> 
  extends Omit<UseFormProps<TFieldValues>, 'resolver'> {
  schema?: z.ZodType<TFieldValues>;
  onSubmit?: (data: TFieldValues) => void | Promise<void>;
  onError?: (error: any) => void;
}

export function useForm<TFieldValues extends FieldValues = FieldValues>({
  schema,
  onSubmit,
  onError,
  defaultValues,
  ...options
}: UseFormOptions<TFieldValues> = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useHookForm<TFieldValues>({
    ...options,
    defaultValues: defaultValues as DefaultValues<TFieldValues>,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  const handleSubmit = useCallback(
    async (data: TFieldValues) => {
      if (!onSubmit) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await onSubmit(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setSubmitError(errorMessage);
        
        if (onError) {
          onError(error);
        } else {
          console.error('Form submission error:', error);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, onError]
  );

  const reset = useCallback(() => {
    form.reset();
    setSubmitError(null);
  }, [form]);

  return {
    ...form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting,
    submitError,
    reset,
  };
}

// Type helper for inferring form data type from schema
export type InferFormData<TSchema> = TSchema extends z.ZodType<infer T> ? T : never;