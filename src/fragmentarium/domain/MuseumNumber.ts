export default interface MuseumNumber {
  readonly prefix: string
  readonly number: string
  readonly suffix: string
}

export function isMuseumNumber(
  museumNumber: unknown,
): museumNumber is MuseumNumber {
  const candidate = museumNumber as Partial<MuseumNumber> | null
  return (
    typeof candidate?.prefix === 'string' &&
    typeof candidate.number === 'string' &&
    typeof candidate.suffix === 'string'
  )
}

export function museumNumberToString(number: MuseumNumber): string {
  return number.suffix
    ? `${number.prefix}.${number.number}.${number.suffix}`
    : `${number.prefix}.${number.number}`
}

export function toMuseumNumberString(museumNumber: unknown): string {
  return isMuseumNumber(museumNumber) ? museumNumberToString(museumNumber) : ''
}
