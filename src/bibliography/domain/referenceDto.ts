import { CslData } from './BibliographyEntry'

export interface ReferenceDto {
  readonly id: string
  readonly type:
    | 'DISCUSSION'
    | 'EDITION'
    | 'DISCUSSION'
    | 'COPY'
    | 'PHOTO'
    | 'TRANSLATION'
    | 'ARCHAEOLOGY'
    | 'ACQUISITION'
    | 'SEAL'
  readonly pages: string
  readonly notes: string
  readonly linesCited: readonly string[]
  readonly document?: CslData | null
}
