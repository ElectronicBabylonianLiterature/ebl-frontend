import { getKingsByDynasty, King } from 'chronology/ui/Kings/Kings'
import { DateField, KingDateField } from 'chronology/domain/DateParameters'

export default function getPreviousKingAndYearIfYearZero(
  king: KingDateField | undefined,
  year: DateField
): { king: KingDateField | undefined; year: DateField } {
  if (
    year.value === '0' &&
    king?.orderInDynasty &&
    king?.orderInDynasty !== '1'
  ) {
    const orderInDynasty = (parseInt(king?.orderInDynasty) - 1).toString()
    const previousKing = getKingsByDynasty(king.dynastyName).find(
      (_king) => _king.orderInDynasty === orderInDynasty
    )
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
  king: KingDateField
): KingDateField {
  return {
    ...previousKing,
    isBroken: king.isBroken,
    isUncertain: king.isUncertain,
  }
}

function getLastYearField(
  year: DateField,
  previousKing: KingDateField
): DateField {
  return {
    value: previousKing?.totalOfYears.replaceAll('?', '') ?? '',
    isBroken: year.isBroken,
    isUncertain: year.isUncertain
      ? year.isUncertain
      : previousKing?.totalOfYears.includes('?')
      ? true
      : undefined,
  }
}
