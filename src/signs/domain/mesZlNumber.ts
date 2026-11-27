export const MES_ZL_LIST = 'MZL'

const PRIME_LOOKALIKES = /['’ʹ]/g

export function normalizeMesZlNumber(number: string): string {
  return number.trim().replace(PRIME_LOOKALIKES, '′')
}

export function normalizeSignListNumber(
  listName: string,
  number: string,
): string {
  return listName === MES_ZL_LIST ? normalizeMesZlNumber(number) : number
}
