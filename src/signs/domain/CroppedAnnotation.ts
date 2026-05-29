import { MesopotamianDate } from 'chronology/domain/Date'

type base64String = string

export interface PcaClustering {
  clusterId: string
  clusterRank: number
  form: string
  isCentroid: boolean
  clusterSize: number
  isMain: boolean
}

export interface CroppedAnnotation {
  image: base64String
  fragmentNumber: string
  provenance?: string
  script: string
  label: string
  date?: MesopotamianDate
  annotationId: string
  pcaClustering?: PcaClustering
}
