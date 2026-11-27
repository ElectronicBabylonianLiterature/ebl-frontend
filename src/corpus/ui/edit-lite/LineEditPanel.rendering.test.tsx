import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  manuscriptGroup,
  renderPanel,
} from 'corpus/ui/edit-lite/LineEditPanel.testSupport'

const mockSiglumRenders: number[] = []

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

jest.mock('corpus/ui/edit-lite/LazySiglumSelect', () => ({
  __esModule: true,
  default: function LazySiglumSelectMock({ value }: { value: number }): null {
    mockSiglumRenders.push(value)
    return null
  },
}))

const [firstLine]: readonly Line[] = buildEditLiteLines()

beforeEach(() => {
  mockSiglumRenders.length = 0
})

test('editing a manuscript line re-renders only its own row', async () => {
  renderPanel(firstLine)

  expect(mockSiglumRenders).toEqual([1, 2])

  mockSiglumRenders.length = 0
  await userEvent.type(
    within(manuscriptGroup(1, 2)).getByRole('textbox', { name: 'Line number' }),
    'ab',
  )

  expect(mockSiglumRenders).toEqual([2, 2])
})

test('editing the line number re-renders no manuscript row', async () => {
  const view = renderPanel(firstLine)
  mockSiglumRenders.length = 0
  await userEvent.type(screen.getByLabelText('Number'), 'abc')

  expect(view.currentLine().number).toBe('1abc')
  expect(mockSiglumRenders).toEqual([])
})
