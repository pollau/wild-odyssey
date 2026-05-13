// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tc(obj: any, key: string, lang: string): string {
  return obj?.[`${key}_${lang}`] ?? obj?.[`${key}_en`] ?? obj?.[key] ?? "";
}
