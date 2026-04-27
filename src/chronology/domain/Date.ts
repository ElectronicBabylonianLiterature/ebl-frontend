import { MesopotamianDateDto } from 'fragmentarium/domain/FragmentDtos'
import { MesopotamianDateString } from 'chronology/domain/DateString'
import { findKingByOrderGlobal } from 'chronology/ui/Kings/Kings'

export class MesopotamianDate extends MesopotamianDateString {
  static fromJson(dateJson: MesopotamianDateDto): MesopotamianDate {
    const kingOrderGlobal = dateJson?.king?.orderGlobal
    let king
    if (kingOrderGlobal !== undefined) {
      const kingFromOrderGlobal = findKingByOrderGlobal(kingOrderGlobal)
      if (kingFromOrderGlobal) {
        king = {
          ...kingFromOrderGlobal,
          orderGlobal: kingOrderGlobal,
          isBroken: dateJson?.king?.isBroken,
          isUncertain: dateJson?.king?.isUncertain,
        }
      }
    }
    return new MesopotamianDate({ ...dateJson, ...{ king: king ?? undefined } })
  }

  toDto(): MesopotamianDateDto {
    const originalKing = this.zeroYearKing ?? this.king
    let king
    if (originalKing?.orderGlobal) {
      king = {
        orderGlobal: originalKing.orderGlobal,
        isBroken: originalKing.isBroken,
        isUncertain: originalKing.isUncertain,
      }
    }
    return {
      ...this,
      year: this.yearZero ?? this.year,
      king,
    }
  }
}
