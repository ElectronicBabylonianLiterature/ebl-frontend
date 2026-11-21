import {
  ChapterChange,
  ChapterEditSource,
  ChapterEditSourceKind,
  ChapterRequest,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import {
  ChapterOutline,
  ManuscriptSummary,
} from 'corpus/application/edit-lite/chapterOutline'
import { describeChapterChange } from 'corpus/application/edit-lite/chapterRequests'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import { createLine, createVariant, EditStatus, Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import { ChapterId } from 'transliteration/domain/chapter-id'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  editLiteChapterId,
  editLiteManuscripts,
  editLiteRevision,
} from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import { moveItem } from 'corpus/ui/edit-lite/lineMove'

export type FakeChapterEditSource = jest.Mocked<ChapterEditSource>

export interface FakeChapterEditSourceOptions {
  readonly kind?: ChapterEditSourceKind
  readonly canSave?: boolean
  readonly lines?: readonly Line[]
  readonly diagnostics?: readonly string[]
  readonly id?: ChapterId
}

interface FakeChapter {
  lines: readonly Line[]
  manuscripts: readonly ManuscriptSummary[]
  uncertainFragments: readonly string[]
}

export function toSavedLine(line: Line): Line {
  return { ...line, status: EditStatus.CLEAN }
}

function toImportedLine(row: string, index: number): Line {
  return createLine({
    number: `${index + 1}`,
    variants: [createVariant({ reconstruction: row })],
  })
}

function toManuscriptSummary(manuscript: Manuscript): ManuscriptSummary {
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

export function createFakeChapterEditSource(
  options: FakeChapterEditSourceOptions = {},
): FakeChapterEditSource {
  const kind = options.kind ?? 'api'
  const canSave = options.canSave ?? kind === 'api'
  const chapter: FakeChapter = {
    lines: options.lines ?? buildEditLiteLines(),
    manuscripts: editLiteManuscripts,
    uncertainFragments: [],
  }
  const buildOutline = (): ChapterOutline => ({
    ...buildEditLiteOutline(chapter.lines),
    manuscripts: chapter.manuscripts,
    uncertainFragments: chapter.uncertainFragments,
  })
  const save = (change: Partial<FakeChapter>): Promise<ChapterOutline> => {
    if (!canSave) {
      return Promise.reject(new Error('Saving is not available.'))
    }
    Object.assign(chapter, change)
    return Promise.resolve(buildOutline())
  }

  return {
    kind,
    canSave,
    diagnostics: options.diagnostics ?? [],
    loadOutline: jest.fn(
      (): Promise<ChapterOutline> => Promise.resolve(buildOutline()),
    ),
    loadLines: jest.fn(
      (offset: number, limit: number): Promise<readonly Line[]> =>
        Promise.resolve(chapter.lines.slice(offset, offset + limit)),
    ),
    describeSave: jest.fn(
      (index: number, draft: Line): LinesUpdateDto =>
        toLineEditsDto(index, draft),
    ),
    describeChange: jest.fn(
      (change: ChapterChange): ChapterRequest =>
        describeChapterChange(
          options.id ?? editLiteChapterId,
          change,
          editLiteRevision,
        ),
    ),
    saveLine: jest.fn((index: number, _original: Line, draft: Line) =>
      save({
        lines: chapter.lines.map((line, lineIndex) =>
          lineIndex === index ? toSavedLine(draft) : line,
        ),
      }),
    ),
    addLine: jest.fn((line: Line) =>
      save({ lines: [...chapter.lines, toSavedLine(line)] }),
    ),
    deleteLine: jest.fn((index: number) =>
      save({
        lines: chapter.lines.filter((_line, lineIndex) => lineIndex !== index),
      }),
    ),
    moveLine: jest.fn((from: number, to: number) =>
      save({ lines: moveItem(chapter.lines, from, to) }),
    ),
    importLines: jest.fn((atf: string) =>
      save({ lines: importFakeLines(chapter.lines, atf) }),
    ),
    saveManuscripts: jest.fn(
      (
        manuscripts: readonly Manuscript[],
        uncertainFragments: readonly string[],
      ) =>
        save({
          manuscripts: manuscripts.map(toManuscriptSummary),
          uncertainFragments,
        }),
    ),
  }
}
