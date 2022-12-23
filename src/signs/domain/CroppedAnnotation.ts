import { Script } from 'fragmentarium/domain/fragment'

type base64String = string

export interface CroppedAnnotation {
  image: base64String
  fragmentNumber: string
  script: Script
  label: string
}
