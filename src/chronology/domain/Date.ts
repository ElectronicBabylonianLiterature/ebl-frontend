import { MesopotamianDateDto } from 'fragmentarium/domain/FragmentDtos'
import { MesopotamianDateString } from 'chronology/domain/DateString'

export class MesopotamianDate extends MesopotamianDateString {
  static fromJson(dateJson: MesopotamianDateDto): MesopotamianDate {
    return new MesopotamianDate({ ...dateJson })
  }
}
