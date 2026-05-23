export function focusFirstFormError(
  errors: Record<string, string | undefined>,
  fields: { key: string; id: string }[],
) {
  for (const { key, id } of fields) {
    if (errors[key]) {
      document.getElementById(id)?.focus()
      return
    }
  }
}
