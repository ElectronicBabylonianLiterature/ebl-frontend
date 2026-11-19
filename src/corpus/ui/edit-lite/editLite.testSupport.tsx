import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import _ from 'lodash'
import {
  ChapterEditSource,
  ChapterEditSourceKind,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import {
  ChapterOutline,
  ManuscriptSummary,
} from 'corpus/application/edit-lite/chapterOutline'
import { toLineOutline } from 'corpus/application/edit-lite/legacySnapshot'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  EditStatus,
  Line,
  ManuscriptLine,
} from 'corpus/domain/line'
import EditLiteContext, {
  EditLiteContextValue,
} from 'corpus/ui/edit-lite/EditLiteContext'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import useEditLite, { EditLite } from 'corpus/ui/edit-lite/useEditLite'

export type FakeChapterEditSource = jest.Mocked<ChapterEditSource>

export interface FakeChapterEditSourceOptions {
  readonly kind?: ChapterEditSourceKind
  readonly canSave?: boolean
  readonly lines?: readonly Line[]
  readonly diagnostics?: readonly string[]
}

export type EditLiteUi =
  | React.ReactElement
  | ((state: EditLiteState) => React.ReactElement)

export interface EditLiteRenderOptions extends FakeChapterEditSourceOptions {
  readonly source?: FakeChapterEditSource
  readonly outline?: ChapterOutline
}

export interface EditLiteRenderResult extends Omit<RenderResult, 'rerender'> {
  readonly source: FakeChapterEditSource
  readonly outline: ChapterOutline
  getState(): EditLiteState
  getContext(): EditLiteContextValue
  rerender(ui: EditLiteUi): void
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

export function buildEditLiteOutline(
  lines: readonly Line[] = buildEditLiteLines(),
): ChapterOutline {
  return {
    textId: { genre: 'L', category: 1, index: 2 },
    classification: 'Ancient',
    stage: 'Standard Babylonian',
    version: '',
    name: 'I',
    order: 1,
    uncertainFragments: [],
    manuscripts: editLiteManuscripts,
    lines: lines.map(toLineOutline),
  }
}

export function createFakeChapterEditSource(
  options: FakeChapterEditSourceOptions = {},
): FakeChapterEditSource {
  const kind = options.kind ?? 'api'
  const canSave = options.canSave ?? kind === 'api'
  let lines: readonly Line[] = options.lines ?? buildEditLiteLines()
  const save = (index: number, draft: Line): Promise<ChapterOutline> => {
    if (!canSave) {
      return Promise.reject(new Error('Saving is not available.'))
    }
    lines = lines.map((line, lineIndex) =>
      lineIndex === index ? { ...draft, status: EditStatus.CLEAN } : line,
    )
    return Promise.resolve(buildEditLiteOutline(lines))
  }

  return {
    kind,
    canSave,
    diagnostics: options.diagnostics ?? [],
    loadOutline: jest.fn(
      (): Promise<ChapterOutline> =>
        Promise.resolve(buildEditLiteOutline(lines)),
    ),
    loadLines: jest.fn(
      (offset: number, limit: number): Promise<readonly Line[]> =>
        Promise.resolve(lines.slice(offset, offset + limit)),
    ),
    describeSave: jest.fn(
      (index: number, draft: Line): LinesUpdateDto =>
        toLineEditsDto(index, draft),
    ),
    saveLine: jest.fn((index: number, _original: Line, draft: Line) =>
      save(index, draft),
    ),
  }
}

interface HarnessProps {
  readonly source: FakeChapterEditSource
  readonly outline: ChapterOutline
  readonly ui: EditLiteUi
  readonly latest: { current?: EditLite }
}

function EditLiteHarness({
  source,
  outline,
  ui,
  latest,
}: HarnessProps): JSX.Element {
  const editLite = useEditLite(source, outline)
  latest.current = editLite
  return (
    <EditLiteContext.Provider value={editLite.context}>
      {typeof ui === 'function' ? ui(editLite.state) : ui}
    </EditLiteContext.Provider>
  )
}

export function renderWithEditLite(
  ui: EditLiteUi,
  options: EditLiteRenderOptions = {},
): EditLiteRenderResult {
  const lines = options.lines ?? buildEditLiteLines()
  const source =
    options.source ?? createFakeChapterEditSource({ ...options, lines })
  const outline = options.outline ?? buildEditLiteOutline(lines)
  const latest: { current?: EditLite } = {}
  const harnessProps = { source, outline, latest }
  const wrap = (wrappedUi: EditLiteUi): JSX.Element => (
    <EditLiteHarness {...harnessProps} ui={wrappedUi} />
  )
  const view = render(wrap(ui))
  const current = (): EditLite => latest.current as EditLite

  return {
    ...view,
    source,
    outline,
    getState: (): EditLiteState => current().state,
    getContext: (): EditLiteContextValue => current().context,
    rerender: (nextUi: EditLiteUi): void => view.rerender(wrap(nextUi)),
  }
}
