import type { ZodError } from "zod";

export const getFieldErrors = <TField extends string>(error: ZodError) => {
  const fieldErrors: Partial<Record<TField, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field !== "string" || fieldErrors[field as TField]) {
      continue;
    }

    fieldErrors[field as TField] = issue.message;
  }

  return fieldErrors;
};
