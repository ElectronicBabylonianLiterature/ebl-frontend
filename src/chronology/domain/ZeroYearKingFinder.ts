import { getKingsByDynasty, King } from 'chronology/ui/Kings/Kings'
import { DateField, KingDateField } from 'chronology/domain/DateParameters'

export default function getPreviousKingAndYearIfYearZero(
  king: KingDateField | undefined,
  year: DateField,
): { king: KingDateField | undefined; year: DateField } {
  if (
    year.value === '0' &&
    king?.orderInDynasty &&
    king?.orderInDynasty !== '1'
  ) {
    const previousKing = getPreviousKingWithNumericTotalOfYears(king)
    if (previousKing) {
      return {
        king: getPreviousKingField(previousKing, king),
        year: getLastYearField(year, previousKing),
      }
    }
    return { king, year }
  }
  return { king, year }
}

function getPreviousKingField(
  previousKing: King,
  king: KingDateField,
): KingDateField {
  return {
    ...previousKing,
    isBroken: king.isBroken,
    isUncertain: king.isUncertain,
  }
}

function getLastYearField(
  year: DateField,
  previousKing: KingDateField,
): DateField {
  const totalOfYears = getNumericTotalOfYears(previousKing.totalOfYears)
  return {
    value: totalOfYears ?? '',
    isBroken: year.isBroken,
    isUncertain: year.isUncertain
      ? year.isUncertain
      : previousKing?.totalOfYears.includes('?')
        ? true
        : undefined,
  }
}

function findKingAtOrderInDynasty(
  kings: readonly King[],
  orderInDynasty: number,
): King | undefined {
  const orderAsString = orderInDynasty.toString()
  return kings.find((candidate) => candidate.orderInDynasty === orderAsString)
}

function getPreviousKingWithNumericTotalOfYears(
  king: KingDateField,
): King | undefined {
  const kings = getKingsByDynasty(king.dynastyName)
  for (
    let previousKingOrderInDynasty = parseInt(king.orderInDynasty) - 1;
    previousKingOrderInDynasty > 0;
    previousKingOrderInDynasty--
  ) {
    const previousKing = findKingAtOrderInDynasty(
      kings,
      previousKingOrderInDynasty,
    )

    if (!previousKing) {
      return undefined
    }

    if (getNumericTotalOfYears(previousKing.totalOfYears) !== undefined) {
      return previousKing
    }
  }

  return undefined
}

function getNumericTotalOfYears(totalOfYears: string): string | undefined {
  const normalizedTotalOfYears = totalOfYears.replaceAll('?', '')
  return /^\d+$/.test(normalizedTotalOfYears)
    ? normalizedTotalOfYears
    : undefined
}
