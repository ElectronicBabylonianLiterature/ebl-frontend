import AkkadischeGlossareUndIndex from 'dictionary/domain/Word'

type AfOPicked = Pick<AkkadischeGlossareUndIndex, 'AfO'>

function compareBeih(a: string, b: string): number {
  return Number(b.includes('Beih')) - Number(a.includes('Beih'))
}

export default function compareAfO(a: AfOPicked, b: AfOPicked): number {
  return compareBeih(b.AfO, a.AfO) || b.AfO.localeCompare(a.AfO)
}
