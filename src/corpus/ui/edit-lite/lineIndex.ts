export function findInitialIndex(
  initialLine: number | undefined,
  lineCount: number,
): number | null {
  return initialLine !== undefined &&
    Number.isInteger(initialLine) &&
    initialLine >= 0 &&
    initialLine < lineCount
    ? initialLine
    : null
}
