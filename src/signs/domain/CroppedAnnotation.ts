type base64String = string

export interface CroppedAnnotation {
  image: base64String
  fragmentNumber: string
  legacyScript: string
  label: string
}
