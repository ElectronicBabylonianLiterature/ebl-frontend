import { toLineDto } from 'corpus/application/chapterDtoSerialization'
import {
  LinesPageDto,
  ManuscriptSummary,
} from 'corpus/application/edit-lite/chapterOutline'
import { createLine, createVariant, EditStatus, Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'

export function toSavedLine(line: Line): Line {
  return { ...line, status: EditStatus.CLEAN }
}

function toImportedLine(row: string, index: number): Line {
  return createLine({
    number: `${index + 1}`,
    variants: [createVariant({ reconstruction: row })],
  })
}

export function toManuscriptSummary(manuscript: Manuscript): ManuscriptSummary {
  return {
    id: Number(manuscript.id),
    siglum: manuscript.siglum,
    museumNumber: manuscript.museumNumber,
    accession: manuscript.accession,
  }
}

export function importFakeLines(
  lines: readonly Line[],
  atf: string,
): readonly Line[] {
  return [
    ...lines,
    ...atf
      .split('\n')
      .filter((row) => row.trim() !== '')
      .map((row, position) => toImportedLine(row, lines.length + position)),
  ]
}

export function toLinesPage(
  lines: readonly Line[],
  offset: number,
  limit: number,
  revision: string,
  toDto: (line: Line) => Record<string, unknown> = toLineDto,
): LinesPageDto {
  return {
    total: lines.length,
    offset,
    limit,
    lines: lines.slice(offset, offset + limit).map(toDto),
    revision,
  }
}
