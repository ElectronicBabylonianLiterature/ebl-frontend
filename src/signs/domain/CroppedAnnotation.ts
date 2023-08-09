import { MesopotamianDate } from 'fragmentarium/domain/Date'

type base64String = string

export interface CroppedAnnotation {
  image: base64String
  fragmentNumber: string
  script: string
  label: string
  date?: MesopotamianDate
}
