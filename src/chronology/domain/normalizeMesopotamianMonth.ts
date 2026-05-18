export default function normalizeMesopotamianMonth(
  month: number,
  isIntercalary?: boolean,
): number {
  if (!isIntercalary) {
    return month
  }

  return { 6: 13, 12: 14 }[month] ?? month
}
