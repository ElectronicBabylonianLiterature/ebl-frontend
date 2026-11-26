import { EblRealiaEntry } from 'realia/domain/RealiaEntry'

export function eblRealiaEntryLabel(
  entry: EblRealiaEntry,
  index: number,
): string {
  const label = [entry.transliteration, entry.translation, entry.id].find(
    (value) => value.trim() !== '',
  )
  return label ?? `Entry ${index + 1}`
}
