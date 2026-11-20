import React from 'react'
import { act, screen, waitFor } from '@testing-library/react'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import { EditStatus } from 'corpus/domain/line'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  createFakeChapterEditSource,
  editLiteManuscripts,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { createEditLiteState } from 'corpus/ui/edit-lite/editLiteReducer'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'

const lines = buildEditLiteLines()

function SourceKind(): JSX.Element {
  return <p>{useEditLiteContext().kind}</p>
}

function countLines(state: EditLiteState): JSX.Element {
  return <p>{Object.keys(state.lines).length} lines</p>
}

test('the outline fixture matches the line fixtures', () => {
  const outline = buildEditLiteOutline()

  expect(outline.manuscripts).toBe(editLiteManuscripts)
  expect(outline.lines.map((line) => line.index)).toEqual([0, 1, 2])
  expect(outline.lines.map((line) => line.number)).toEqual(
    lines.map((line) => line.number),
  )
  expect(outline.lines[1].variants).toEqual([
    { reconstruction: '%n šapliš | ammatu', manuscriptIds: [1] },
    { reconstruction: '%n šapliš | erṣetu', manuscriptIds: [] },
  ])
  expect(outline.lines[0].translation).toBe(lines[0].translation)
  expect(outline.lines[2].isSecondLineOfParallelism).toBe(true)
  expect(outline.lines[0].isBeginningOfSection).toBe(true)
})

test('more lines can be built for navigation', () => {
  const manyLines = buildEditLiteLines(12)

  expect(manyLines.slice(0, 3)).toEqual(lines)
  expect(buildEditLiteLines(2)).toEqual(lines.slice(0, 2))
  expect(manyLines.map((line) => line.number)).toEqual(
    Array.from({ length: 12 }, (_value, index) => `${index + 1}`),
  )
  expect(buildEditLiteOutline(manyLines).lines[11]).toEqual({
    index: 11,
    number: '12',
    isSecondLineOfParallelism: false,
    isBeginningOfSection: false,
    translation: '#tr.en: Translation of line 12',
    variants: [
      { reconstruction: '%n reconstruction of line 12', manuscriptIds: [1] },
    ],
  })
})

test('the fake source serves its lines and describes saves', async () => {
  const source = createFakeChapterEditSource()

  expect(source.kind).toBe('api')
  expect(source.canSave).toBe(true)
  expect(source.diagnostics).toEqual([])
  expect(
    createFakeChapterEditSource({ diagnostics: ['a problem'] }).diagnostics,
  ).toEqual(['a problem'])
  await expect(source.loadOutline()).resolves.toEqual(buildEditLiteOutline())
  await expect(source.loadLines(1, 5)).resolves.toEqual(lines.slice(1))
  expect(source.describeSave(1, lines[1])).toEqual(toLineEditsDto(1, lines[1]))
})

test('the fake source stores saved lines', async () => {
  const source = createFakeChapterEditSource({ lines })
  const draft = setLineNumber(lines[0], '1a')
  const outline = await source.saveLine(0, lines[0], draft)

  expect(outline.lines.map((line) => line.number)).toEqual(['1a', '2', '3'])
  await expect(source.loadLines(0, 2)).resolves.toEqual([
    { ...draft, status: EditStatus.CLEAN },
    lines[1],
  ])
})

test.each([
  [{ kind: 'legacy' } as const, 'legacy'],
  [{ canSave: false } as const, 'api'],
])('the fake source %o cannot save', async (options, kind) => {
  const source = createFakeChapterEditSource(options)

  expect(source.kind).toBe(kind)
  expect(source.canSave).toBe(false)
  await expect(source.saveLine(0, lines[0], lines[0])).rejects.toThrow(
    'Saving is not available.',
  )
})

test('renderWithEditLite provides the context and the state', async () => {
  const view = renderWithEditLite(countLines, { kind: 'legacy', lines })

  expect(screen.getByText('0 lines')).toBeVisible()
  expect(view.source.kind).toBe('legacy')
  expect(view.outline).toEqual(buildEditLiteOutline(lines))
  expect(view.getState()).toEqual(createEditLiteState(view.outline))
  expect(view.getContext().kind).toBe('legacy')

  act(() => view.getContext().actions.ensureLines(0, 2))

  expect(await screen.findByText('2 lines')).toBeVisible()
  await waitFor(() => expect(view.getState().lines[1].original).toBe(lines[1]))

  view.rerender(<SourceKind />)

  expect(screen.getByText('legacy')).toBeVisible()
  expect(view.getState().lines[1].original).toBe(lines[1])
})

test('renderWithEditLite accepts a prepared source and outline', () => {
  const source = createFakeChapterEditSource({ lines: lines.slice(0, 1) })
  const outline = buildEditLiteOutline(lines.slice(0, 1))
  const view = renderWithEditLite(<SourceKind />, { source, outline })

  expect(screen.getByText('api')).toBeVisible()
  expect(view.source).toBe(source)
  expect(view.getState().outline).toBe(outline)
})
