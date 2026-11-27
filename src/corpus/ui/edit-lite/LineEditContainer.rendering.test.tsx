import React from 'react'
import { act, screen } from '@testing-library/react'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import LineEditContainer from 'corpus/ui/edit-lite/LineEditContainer'

const mockPanelRenders: string[] = []

jest.mock('corpus/ui/edit-lite/LineEditPanel', () => ({
  __esModule: true,
  default: function LineEditPanelMock({ line }: { line: Line }): JSX.Element {
    mockPanelRenders.push(line.number)
    return <p>Line {line.number}</p>
  },
}))

const lines = buildEditLiteLines()

test('editing one line does not re-render the other lines', async () => {
  const { getContext } = renderWithEditLite((state: EditLiteState) => (
    <>
      <LineEditContainer index={0} lineState={state.lines[0]} />
      <LineEditContainer index={1} lineState={state.lines[1]} />
    </>
  ))
  await screen.findByText('Line 2')

  expect(mockPanelRenders).toEqual(['1', '2'])

  mockPanelRenders.length = 0
  act(() => getContext().actions.changeLine(0, setLineNumber(lines[0], '1a')))
  act(() => getContext().actions.changeLine(0, setLineNumber(lines[0], '1b')))

  expect(screen.getByText('Line 1b')).toBeVisible()
  expect(mockPanelRenders).toEqual(['1a', '1b'])

  act(() => getContext().actions.resetLine(0))

  expect(mockPanelRenders).toEqual(['1a', '1b', '1'])
})
