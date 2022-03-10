import { AbstractLine } from 'transliteration/domain/abstract-line'
import { SurfaceLabel } from 'transliteration/domain/labels'

export interface LineProps {
  line: AbstractLine
  columns: number
  surface?: SurfaceLabel | null
  activeLine?: string
}
