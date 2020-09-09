export default interface MuseumNumber {
  readonly prefix: string
  readonly number: string
  readonly suffix: string
}

export function museumNumberToString(number: MuseumNumber): string {
  return number.suffix
    ? `${number.prefix}.${number.number}.${number.suffix}`
    : `${number.prefix}.${number.number}`
}
