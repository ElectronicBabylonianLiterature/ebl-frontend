import MuseumNumber from 'fragmentarium/domain/MuseumNumber'

export interface ChapterAtfSnapshotManuscriptDto {
  readonly id: number
  readonly siglumDisambiguator: string
  readonly museumNumber: MuseumNumber | null
  readonly accession: string
  readonly period: string
  readonly provenance: string
  readonly type: string
}

export interface ChapterAtfSnapshotDto {
  readonly atf: string
  readonly manuscripts: readonly ChapterAtfSnapshotManuscriptDto[]
}
