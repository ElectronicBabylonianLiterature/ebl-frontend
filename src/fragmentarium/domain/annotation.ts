export interface Geometry {
  x: number
  y: number
  height: number
  width: number
}

export interface AnnotationData {
  id?: string
  value: string
  path: readonly number[]
}

export default interface Annotation {
  geometry: Geometry
  data: AnnotationData
}
