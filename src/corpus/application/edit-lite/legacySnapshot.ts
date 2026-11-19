import { Periods } from 'common/utils/periodDefinitions'
import {
  ParsedLine,
  ParsedManuscriptLine,
  ParsedVariant,
  parseChapterAtf,
} from 'corpus/application/edit-lite/chapterAtfParser'
import {
  ChapterAtfSnapshotDto,
  ChapterAtfSnapshotManuscriptDto,
} from 'corpus/application/edit-lite/chapterAtfSnapshot'
import {
  ChapterOutline,
  LineOutline,
  ManuscriptSummary,
} from 'corpus/application/edit-lite/chapterOutline'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  EditStatus,
  Line,
  LineVariant,
} from 'corpus/domain/line'
import { Manuscript, ManuscriptTypes } from 'corpus/domain/manuscript'
import { getProvenanceByName } from 'corpus/domain/provenance'
import { toMuseumNumberString } from 'fragmentarium/domain/MuseumNumber'
import { ChapterId } from 'transliteration/domain/chapter-id'

export interface LegacySnapshot {
  readonly outline: ChapterOutline
  readonly lines: readonly Line[]
  readonly diagnostics: readonly string[]
}

interface SiglumIndex {
  readonly idsBySiglum: ReadonlyMap<string, number>
  readonly diagnostics: readonly string[]
}

interface UnresolvedSiglum {
  readonly rowCount: number
  readonly firstLineNumber: string
}

const unresolvedManuscriptId = 0

function toManuscriptSummary(
  manuscript: ChapterAtfSnapshotManuscriptDto,
): ManuscriptSummary {
  return {
    id: manuscript.id,
    siglum: new Manuscript({
      id: manuscript.id,
      siglumDisambiguator: manuscript.siglumDisambiguator,
      period: Periods[manuscript.period],
      provenance: getProvenanceByName(manuscript.provenance),
      type: ManuscriptTypes[manuscript.type],
    }).siglum,
    museumNumber: toMuseumNumberString(manuscript.museumNumber),
    accession: manuscript.accession,
  }
}

function createSiglumIndex(
  manuscripts: readonly ManuscriptSummary[],
): SiglumIndex {
  const idsBySiglum = new Map<string, number>()
  const diagnostics: string[] = []
  manuscripts.forEach(({ id, siglum }) => {
    const existingId = idsBySiglum.get(siglum)
    if (existingId === undefined) {
      idsBySiglum.set(siglum, id)
    } else {
      diagnostics.push(
        `Siglum "${siglum}" is shared by manuscripts ${existingId} and ${id}; rows are assigned to manuscript ${existingId}.`,
      )
    }
  })
  return { idsBySiglum, diagnostics }
}

function describeUnresolvedSigla(
  lines: readonly ParsedLine[],
  idsBySiglum: ReadonlyMap<string, number>,
): string[] {
  const unresolvedSigla = new Map<string, UnresolvedSiglum>()
  lines.forEach((line) =>
    line.variants.forEach((variant) =>
      variant.manuscripts
        .filter(({ siglum }) => !idsBySiglum.has(siglum))
        .forEach(({ siglum }) => {
          const known = unresolvedSigla.get(siglum)
          unresolvedSigla.set(siglum, {
            rowCount: (known?.rowCount ?? 0) + 1,
            firstLineNumber: known?.firstLineNumber ?? line.number,
          })
        }),
    ),
  )
  return Array.from(
    unresolvedSigla,
    ([siglum, { rowCount, firstLineNumber }]) =>
      `Unknown siglum "${siglum}" in ${rowCount} manuscript row(s), first in line ${firstLineNumber}.`,
  )
}

function resolveManuscriptId(
  manuscriptLine: ParsedManuscriptLine,
  idsBySiglum: ReadonlyMap<string, number>,
): number {
  return idsBySiglum.get(manuscriptLine.siglum) ?? unresolvedManuscriptId
}

function toLineVariant(
  variant: ParsedVariant,
  idsBySiglum: ReadonlyMap<string, number>,
): LineVariant {
  return createVariant({
    reconstruction: variant.reconstruction,
    intertext: '',
    manuscripts: variant.manuscripts.map((manuscriptLine) =>
      createManuscriptLine({
        manuscriptId: resolveManuscriptId(manuscriptLine, idsBySiglum),
        labels: manuscriptLine.labels,
        number: manuscriptLine.number,
        atf: manuscriptLine.atf,
        omittedWords: [],
      }),
    ),
  })
}

function toLine(
  line: ParsedLine,
  idsBySiglum: ReadonlyMap<string, number>,
): Line {
  return createLine({
    number: line.number,
    translation: line.translation,
    variants: line.variants.map((variant) =>
      toLineVariant(variant, idsBySiglum),
    ),
    status: EditStatus.CLEAN,
  })
}

export function toLineOutline(line: Line, index: number): LineOutline {
  return {
    index,
    number: line.number,
    isSecondLineOfParallelism: line.isSecondLineOfParallelism,
    isBeginningOfSection: line.isBeginningOfSection,
    translation: line.translation,
    variants: line.variants.map((variant) => ({
      reconstruction: variant.reconstruction,
      manuscriptIds: variant.manuscripts.map(
        (manuscriptLine) => manuscriptLine.manuscriptId,
      ),
    })),
  }
}

export function createLegacySnapshot(
  id: ChapterId,
  snapshot: ChapterAtfSnapshotDto,
): LegacySnapshot {
  const parsed = parseChapterAtf(snapshot.atf)
  const manuscripts = snapshot.manuscripts.map(toManuscriptSummary)
  const siglumIndex = createSiglumIndex(manuscripts)
  const lines = parsed.lines.map((line) =>
    toLine(line, siglumIndex.idsBySiglum),
  )
  return {
    outline: {
      textId: id.textId,
      classification: '',
      stage: id.stage,
      version: '',
      name: id.name,
      order: 0,
      uncertainFragments: [],
      manuscripts,
      lines: lines.map(toLineOutline),
    },
    lines,
    diagnostics: [
      ...parsed.diagnostics,
      ...siglumIndex.diagnostics,
      ...describeUnresolvedSigla(parsed.lines, siglumIndex.idsBySiglum),
    ],
  }
}
