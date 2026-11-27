import { Dto } from 'test-support/FakeApiExpectation'
import _ from 'lodash'
import {
  ChapterOutline,
  ManuscriptSummary,
  toLineOutline,
} from 'corpus/application/edit-lite/chapterOutline'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  Line,
  ManuscriptLine,
} from 'corpus/domain/line'
import { EditLiteAction } from 'corpus/ui/edit-lite/editLiteState'
import { createChapterUrl } from 'test-support/FakeApiExpectation'
import { ChapterId } from 'transliteration/domain/chapter-id'

export const editLiteChapterId: ChapterId = {
  textId: { genre: 'L', category: 1, index: 2 },
  stage: 'Standard Babylonian',
  name: 'I',
}

export const editLiteManuscripts: readonly ManuscriptSummary[] = [
  { id: 1, siglum: 'NinNA1a', museumNumber: 'K.5419.C', accession: '' },
  { id: 2, siglum: 'BabaNBSch1', museumNumber: 'BM.34104', accession: 'A.2' },
]

function manuscriptLine(
  manuscriptId: number,
  labels: readonly string[],
  number: string,
  atf: string,
): ManuscriptLine {
  return createManuscriptLine({ manuscriptId, labels, number, atf })
}

function buildNamedLines(): Line[] {
  return [
    createLine({
      number: '1',
      isBeginningOfSection: true,
      translation: '#tr.en: When on high\n#tr.ar: translation in Arabic',
      variants: [
        createVariant({
          reconstruction: '%n enūma | eliš\n#note: a note',
          manuscripts: [
            manuscriptLine(1, ['o'], '1', 'e-nu-ma e-liš'),
            manuscriptLine(2, ['o', 'i'], "6'", '[x x x] e-li-iš'),
          ],
        }),
      ],
    }),
    createLine({
      number: '2',
      translation: '#tr.en: Nor below',
      variants: [
        createVariant({
          reconstruction: '%n šapliš | ammatu',
          manuscripts: [manuscriptLine(1, ['o'], '2', 'šap-liš am-ma-tu')],
        }),
        createVariant({ reconstruction: '%n šapliš | erṣetu' }),
      ],
    }),
    createLine({
      number: '3',
      isSecondLineOfParallelism: true,
      variants: [
        createVariant({
          reconstruction: '%n apsûm-ma',
          manuscripts: [manuscriptLine(2, [], '8', 'ap-su-um-ma')],
        }),
      ],
    }),
  ]
}

function buildNumberedLine(index: number): Line {
  const number = `${index + 1}`
  return createLine({
    number,
    translation: `#tr.en: Translation of line ${number}`,
    variants: [
      createVariant({
        reconstruction: `%n reconstruction of line ${number}`,
        manuscripts: [manuscriptLine(1, ['o'], number, `kur ${number}`)],
      }),
    ],
  })
}

export function buildEditLiteLines(count = 3): Line[] {
  const namedLines = buildNamedLines()
  return _.range(count).map(
    (index) => namedLines[index] ?? buildNumberedLine(index),
  )
}

export const editLiteRevision = 'revision-1'

export function buildEditLiteOutline(
  lines: readonly Line[] = buildEditLiteLines(),
  revision: string = editLiteRevision,
): ChapterOutline {
  return {
    textId: editLiteChapterId.textId,
    classification: 'Ancient',
    stage: editLiteChapterId.stage,
    version: '',
    name: editLiteChapterId.name,
    order: 1,
    uncertainFragments: [],
    manuscripts: editLiteManuscripts,
    lines: lines.map(toLineOutline),
    revision,
  }
}

export function buildLineUrl(index: number, revision: string): string {
  return `${createChapterUrl(editLiteChapterId)}/lines?offset=${index}&limit=1&revision=${revision}`
}

export function buildAnnotatedLineUrl(index: number, revision: string): string {
  return `${buildLineUrl(index, revision)}&tokens=true`
}

export function buildAnnotationUrl(
  annotation: 'alignment' | 'lemmatization',
  index: number,
  revision: string,
): string {
  return `${createChapterUrl(editLiteChapterId)}/lines/${index}/${annotation}?view=outline&revision=${revision}`
}

export function buildMoveUrl(revision: string): string {
  return `${createChapterUrl(editLiteChapterId)}/lines/move?view=outline&revision=${revision}`
}

export function listLineNumbers(
  lines: readonly { readonly number: string }[],
): string[] {
  return lines.map((line) => line.number)
}

export function buildLinesLoadedActions(
  offset: number,
  lines: readonly Line[],
): EditLiteAction[] {
  return [
    {
      type: 'linesRequested',
      indices: lines.map((_line, position) => offset + position),
    },
    { type: 'linesLoaded', offset, lines },
  ]
}

export function buildLinesFailedActions(
  indices: readonly number[],
  error: string,
): EditLiteAction[] {
  return [
    { type: 'linesRequested', indices },
    { type: 'linesFailed', indices, error },
  ]
}

export function buildLineSavedActions(
  index: number,
  outline: ChapterOutline,
  line: Line | null,
): EditLiteAction[] {
  return [
    { type: 'saveStarted', index },
    { type: 'outlineReplaced', outline },
    { type: 'saveSucceeded', index, line },
  ]
}

export const editLiteTextDto: Dto = {
  ...editLiteChapterId.textId,
  name: 'Poem of Creation',
  numberOfVerses: 162,
  approximateVerses: false,
  intro: '',
  chapters: [
    {
      stage: 'Standard Babylonian',
      name: 'I',
      title: [],
      uncertainFragments: [
        { museumNumber: { prefix: 'K', number: '1', suffix: '' } },
      ],
    },
    {
      stage: 'Standard Babylonian',
      name: 'II',
      title: [],
      uncertainFragments: [],
    },
  ],
  references: [],
}
