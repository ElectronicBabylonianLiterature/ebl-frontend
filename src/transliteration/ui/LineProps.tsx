import { AbstractLine } from 'transliteration/domain/abstract-line'
import { Labels } from 'transliteration/domain/labels'

export interface LineProps {
  line: AbstractLine
  columns: number
  labels?: Labels
  activeLine?: string
}
