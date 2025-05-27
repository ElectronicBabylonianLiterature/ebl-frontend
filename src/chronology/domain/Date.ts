import { MesopotamianDateDto } from 'fragmentarium/domain/FragmentDtos'
import { MesopotamianDateString } from 'chronology/domain/DateString'
import { findKingByOrderGlobal } from 'chronology/ui/Kings/Kings'

export class MesopotamianDate extends MesopotamianDateString {
  static fromJson(dateJson: MesopotamianDateDto): MesopotamianDate {
    const kingOrderGlobal = dateJson?.king?.orderGlobal
    const king = kingOrderGlobal
      ? findKingByOrderGlobal(kingOrderGlobal)
      : undefined
    return new MesopotamianDate({ ...dateJson, ...{ king: king ?? undefined } })
  }
  ˆ

  toDto(): MesopotamianDateDto {
    let king
    if (this?.king?.orderGlobal) {
      king = {
        orderGlobal: this?.king?.orderGlobal,
        isBroken: this?.king?.isBroken,
        isUncertain: this?.king?.isUncertain,
      }
    }
    return {
      ...this,
      king,
    }
  }
}
