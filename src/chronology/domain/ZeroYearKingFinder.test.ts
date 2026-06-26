import getPreviousKingAndYearIfYearZero from 'chronology/domain/ZeroYearKingFinder'
import { getKingsByDynasty } from 'chronology/ui/Kings/Kings'

describe('ZeroYearKingFinder', () => {
  it('does not change date when year is not 0', () => {
    const kings = getKingsByDynasty('Neo-Babylonian Dynasty')
    const nabonidus = kings.find((king) => king.name === 'Nabonidus')

    const result = getPreviousKingAndYearIfYearZero(nabonidus, { value: '1' })

    expect(result.king?.name).toBe('Nabonidus')
    expect(result.year.value).toBe('1')
  })

  it('does not change date when king is first in dynasty', () => {
    const kings = getKingsByDynasty('Dynasty of Akkad')
    const sargon = kings.find((king) => king.name === 'Sargon')

    const result = getPreviousKingAndYearIfYearZero(sargon, { value: '0' })

    expect(result.king?.name).toBe('Sargon')
    expect(result.year.value).toBe('0')
  })

  it('has Labaši-Marduk directly before Nabonidus with non-numeric totalOfYears', () => {
    const kings = getKingsByDynasty('Neo-Babylonian Dynasty')
    const nabonidus = kings.find((king) => king.name === 'Nabonidus')
    const previousKing = kings.find((king) => king.orderInDynasty === '5')

    expect(nabonidus?.orderInDynasty).toBe('6')
    expect(previousKing?.name).toBe('Labaši-Marduk')
    expect(previousKing?.totalOfYears).toBe('3 months')
    expect(Number.isNaN(Number(previousKing?.totalOfYears))).toBe(true)
  })

  it('walks back to the closest previous king with numeric totalOfYears for year 0 conversion', () => {
    const kings = getKingsByDynasty('Neo-Babylonian Dynasty')
    const nabonidus = kings.find((king) => king.name === 'Nabonidus')

    const result = getPreviousKingAndYearIfYearZero(nabonidus, { value: '0' })

    expect(result.king?.name).toBe('Neriglissar')
    expect(result.year.value).toBe('4')
  })

  it('marks calculation year uncertain when previous numeric totalOfYears has question mark', () => {
    const kings = getKingsByDynasty('Dynasty of Akkad')
    const rimush = kings.find((king) => king.name === 'Rimuš')

    const result = getPreviousKingAndYearIfYearZero(rimush, { value: '0' })

    expect(result.king?.name).toBe('Sargon')
    expect(result.year.value).toBe('56')
    expect(result.year.isUncertain).toBe(true)
  })

  it('uses the immediately preceding base king for a letter-suffixed sub-ruler', () => {
    const kings = getKingsByDynasty('Persian Rulers')
    const bardiya = kings.find((king) => king.name === 'Bardiya')

    expect(bardiya?.orderInDynasty).toBe('2a')

    const result = getPreviousKingAndYearIfYearZero(bardiya, { value: '0' })

    expect(result.king?.name).toBe('Cambyses')
    expect(result.year.value).toBe('8')
  })

  it('preserves an uncertain year flag through the conversion', () => {
    const kings = getKingsByDynasty('Persian Rulers')
    const bardiya = kings.find((king) => king.name === 'Bardiya')

    const result = getPreviousKingAndYearIfYearZero(bardiya, {
      value: '0',
      isUncertain: true,
    })

    expect(result.king?.name).toBe('Cambyses')
    expect(result.year.isUncertain).toBe(true)
  })

  it('keeps original king and year when the preceding dynasty order is missing', () => {
    const kings = getKingsByDynasty('Kassite Dynasty')
    const urzigurumaš = kings.find((king) => king.name === 'Urzigurumaš')

    expect(urzigurumaš?.orderInDynasty).toBe('6')
    expect(kings.some((king) => king.orderInDynasty === '5')).toBe(false)

    const result = getPreviousKingAndYearIfYearZero(urzigurumaš, { value: '0' })

    expect(result.king?.name).toBe('Urzigurumaš')
    expect(result.year.value).toBe('0')
  })

  it('keeps original king and year when no numeric previous totalOfYears exists', () => {
    const kings = getKingsByDynasty('Marad Dynasty')
    const yamsiEl = kings.find((king) => king.name === 'Yamsi-El')

    const result = getPreviousKingAndYearIfYearZero(yamsiEl, { value: '0' })

    expect(result.king?.name).toBe('Yamsi-El')
    expect(result.year.value).toBe('0')
  })
})
