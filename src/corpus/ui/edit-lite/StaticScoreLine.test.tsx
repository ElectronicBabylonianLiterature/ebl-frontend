import React, { useState } from 'react'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useNearViewport from 'common/hooks/useNearViewport'
import { createLine } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  createFakeChapterEditSource,
  editLiteManuscripts,
  EditLiteRenderOptions,
  EditLiteRenderResult,
  EditLiteUi,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { SiglumLookup } from 'corpus/ui/edit-lite/StaticScoreContent'
import StaticScoreLine, {
  estimateScoreLineHeight,
  nearViewportMargin,
  retryHint,
  scoreChunkSize,
} from 'corpus/ui/edit-lite/StaticScoreLine'

jest.mock('common/hooks/useNearViewport')
jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const sigla: SiglumLookup = new Map(
  editLiteManuscripts.map((manuscript) => [manuscript.id, manuscript.siglum]),
)
const useNearViewportMock = useNearViewport as jest.MockedFunction<
  typeof useNearViewport
>
let containerRef: jest.Mock
let onEdit: jest.Mock
let onDone: jest.Mock
let onRetry: jest.Mock
let approachViewport: () => void

function setNearViewport(isNearViewport: boolean): void {
  useNearViewportMock.mockReturnValue({ containerRef, isNearViewport })
}

function useApproachableViewport(): ReturnType<typeof useNearViewport> {
  const [isNearViewport, setIsNearViewport] = useState<boolean>(false)
  approachViewport = (): void => setIsNearViewport(true)
  return { containerRef, isNearViewport }
}

function scoreLine(isEditing: boolean, index = 0): EditLiteUi {
  return function ScoreLine(state: EditLiteState): JSX.Element {
    return (
      <StaticScoreLine
        line={state.outline.lines[index]}
        lineState={state.lines[index]}
        sigla={sigla}
        isEditing={isEditing}
        onEdit={onEdit}
        onDone={onDone}
        onRetry={onRetry}
      />
    )
  }
}

function renderScoreLine(
  isEditing = false,
  options: EditLiteRenderOptions = {},
): EditLiteRenderResult {
  return renderWithEditLite(scoreLine(isEditing), options)
}

function placeholder(): HTMLElement {
  return containerRef.mock.calls[0][0]
}

beforeEach(() => {
  containerRef = jest.fn()
  onEdit = jest.fn()
  onDone = jest.fn()
  onRetry = jest.fn()
})

test('renders only a placeholder while it is far from the viewport', () => {
  setNearViewport(false)
  const { source } = renderScoreLine()

  expect(useNearViewportMock).toHaveBeenCalledWith(nearViewportMargin)
  expect(nearViewportMargin).toBe('600px')
  expect(placeholder()).toBeEmptyDOMElement()
  expect(placeholder()).toHaveStyle({ minHeight: '8.6rem' })
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(source.loadLines).not.toHaveBeenCalled()
})

test('a line that is edited far from the viewport stays a placeholder', () => {
  setNearViewport(false)
  const view = renderScoreLine()
  view.rerender(scoreLine(true))

  expect(placeholder()).toBeEmptyDOMElement()
  expect(screen.queryByRole('group')).not.toBeInTheDocument()
  expect(view.source.loadLines).not.toHaveBeenCalled()
})

test('mounts the outline and requests its line once it is near the viewport', async () => {
  useNearViewportMock.mockImplementation(useApproachableViewport)
  const { source } = renderScoreLine()

  expect(placeholder()).toBeEmptyDOMElement()
  expect(source.loadLines).not.toHaveBeenCalled()

  act(() => approachViewport())
  const block = screen.getByRole('button')

  expect(block).toBe(placeholder())
  expect(block).not.toHaveStyle({ minHeight: '8.6rem' })
  expect(within(block).getByText('%n enūma | eliš')).toBeVisible()
  expect(within(block).getByText('When on high')).toBeVisible()
  expect(await within(block).findByText('o 1. e-nu-ma e-liš')).toBeVisible()
  expect(source.loadLines.mock.calls).toEqual([[0, 3]])
})

test('requests the whole chunk of lines that it belongs to', async () => {
  setNearViewport(true)
  const { source } = renderWithEditLite(scoreLine(false, 12), {
    lines: buildEditLiteLines(25),
  })

  expect(
    await within(screen.getByRole('button')).findByText('o 13. kur 13'),
  ).toBeVisible()
  expect(scoreChunkSize).toBe(10)
  expect(source.loadLines.mock.calls).toEqual([[10, 10]])
})

test('reports that the line should be edited', async () => {
  setNearViewport(true)
  renderScoreLine()
  const block = screen.getByRole('button')
  await within(block).findByText('o 1. e-nu-ma e-liš')
  await userEvent.click(block)

  expect(onEdit.mock.calls).toEqual([[0]])
  expect(onDone).not.toHaveBeenCalled()
})

test('reports that a line that failed to load should be loaded again', async () => {
  setNearViewport(true)
  const source = createFakeChapterEditSource()
  source.loadLines.mockRejectedValueOnce(new Error('Network down'))
  renderScoreLine(false, { source })
  const block = screen.getByRole('button')
  await within(block).findByText(`Network down ${retryHint}`)
  await userEvent.click(block)

  expect(onRetry).toHaveBeenCalledTimes(1)
  expect(onEdit).not.toHaveBeenCalled()
  expect(source.loadLines).toHaveBeenCalledTimes(1)
})

test('reports that editing is done', async () => {
  setNearViewport(true)
  renderScoreLine(true)
  const editing = screen.getByRole('group', { name: 'Editing line 1' })
  await within(editing).findByLabelText('Number')

  expect(within(editing).getByText('Line 1')).toBeVisible()
  expect(
    within(editing).getByRole('button', { name: 'Done' }),
  ).not.toHaveFocus()

  await userEvent.click(within(editing).getByRole('button', { name: 'Done' }))

  expect(onDone.mock.calls).toEqual([[0]])
  expect(onEdit).not.toHaveBeenCalled()
})

test.each([
  [createLine({ number: '1' }), '2.1rem'],
  [createLine({ number: '1', translation: '#tr.en: One' }), '2.1rem'],
  [
    createLine({ number: '1', translation: '#tr.en: One\n#tr.de: Eins' }),
    '3.4rem',
  ],
])('estimates the height of a short line', (line, height) => {
  expect(estimateScoreLineHeight(buildEditLiteOutline([line]).lines[0])).toBe(
    height,
  )
})

test('estimates the height from the rows of the outline', () => {
  const [first, second, third] = buildEditLiteOutline().lines

  expect(estimateScoreLineHeight(first)).toBe('8.6rem')
  expect(estimateScoreLineHeight(second)).toBe('6rem')
  expect(estimateScoreLineHeight(third)).toBe('3.4rem')
})
