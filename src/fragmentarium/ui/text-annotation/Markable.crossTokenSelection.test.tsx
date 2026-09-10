import { fireEvent, screen, waitFor } from '@testing-library/react'
import {
  mockBrowserSelection,
  renderTwoMarkables,
} from 'fragmentarium/ui/text-annotation/markable.testSupport'

jest.mock('realia/application/RealiaService')

const bothWords = ['Word-1', 'Word-2']

let setSelection: jest.Mock
let restoreSelection: () => void

beforeEach(() => {
  jest.clearAllMocks()
  setSelection = jest.fn()
})

afterEach(() => {
  restoreSelection?.()
})

function releaseOnSecondToken(): void {
  fireEvent.mouseUp(screen.getAllByText('kur')[1])
}

describe('selecting across tokens', () => {
  it('selects both when the selection starts on the separator', async () => {
    const { separator, secondMarkable } = renderTwoMarkables(setSelection)
    restoreSelection = mockBrowserSelection({
      anchorNode: separator,
      focusNode: secondMarkable,
      addRange: jest.fn(),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    })

    releaseOnSecondToken()

    await waitFor(() => expect(setSelection).toHaveBeenCalledWith(bothWords))
  })

  it('selects both when only the range boundaries define the selection', async () => {
    const { container, firstMarkable, secondMarkable } =
      renderTwoMarkables(setSelection)
    restoreSelection = mockBrowserSelection({
      anchorNode: container,
      focusNode: container,
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        startContainer: firstMarkable,
        endContainer: secondMarkable,
      }),
      addRange: jest.fn(),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    })

    releaseOnSecondToken()

    await waitFor(() => expect(setSelection).toHaveBeenCalledWith(bothWords))
  })

  it('selects both when the selection is collapsed but its range is not', async () => {
    const { container, firstMarkable, secondMarkable } =
      renderTwoMarkables(setSelection)
    restoreSelection = mockBrowserSelection({
      anchorNode: container,
      focusNode: container,
      isCollapsed: true,
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        collapsed: false,
        startContainer: firstMarkable,
        endContainer: secondMarkable,
      }),
      addRange: jest.fn(),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    })

    releaseOnSecondToken()

    await waitFor(() => expect(setSelection).toHaveBeenCalledWith(bothWords))
  })

  it('selects nothing when a collapsed selection starts on the separator', async () => {
    const { separator } = renderTwoMarkables(setSelection)
    restoreSelection = mockBrowserSelection({
      anchorNode: separator,
      focusNode: separator,
      isCollapsed: true,
      rangeCount: 0,
      getRangeAt: jest.fn(),
      addRange: jest.fn(),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    })

    releaseOnSecondToken()

    await waitFor(() => expect(setSelection).not.toHaveBeenCalled())
  })
})
