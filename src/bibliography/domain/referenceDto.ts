import { CslData } from './BibliographyEntry'

export interface ReferenceDto {
  readonly id: string
  readonly type: 'DISCUSSION'
  readonly pages: string
  readonly notes: ''
  readonly linesCited: []
  readonly document?: CslData | null
}
