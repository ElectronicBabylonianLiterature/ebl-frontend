import { fireEvent, screen, waitFor } from '@testing-library/react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { getSelectedTokens } from 'fragmentarium/ui/text-annotation/selectionUtils'
import {
  createRange,
  createSelection,
} from 'fragmentarium/ui/text-annotation/selection.testSupport'
import {
  getMarkableButtons,
  renderTextAnnotation,
} from 'fragmentarium/ui/text-annotation/textAnnotationRender.testSupport'

jest.mock('realia/application/RealiaService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('react-bootstrap', () =>
  jest
    .requireActual('fragmentarium/ui/text-annotation/overlayStub.testSupport')
    .reactBootstrapWithVisibleOverlay(),
)

const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

const setup = async (): Promise<void> => {
  await renderTextAnnotation(fragmentServiceMock)
}

describe('Named Entity Annotation selection fallbacks', () => {
  it('handles selection that finalizes after mouse up', async () => {
    await setup()

    const [firstMarkable, secondMarkable] = getMarkableButtons()
    const selectionAnchor = screen.getByText('(obverse?!)')

    const collapsedSelection = {
      anchorNode: selectionAnchor,
      focusNode: selectionAnchor,
      isCollapsed: true,
      rangeCount: 0,
      getRangeAt: jest.fn(),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection
    const expandedSelection = {
      anchorNode: selectionAnchor,
      focusNode: selectionAnchor,
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        startContainer: firstMarkable,
        endContainer: secondMarkable,
      }),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection

    let currentSelection: Selection = collapsedSelection
    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockImplementation(() => currentSelection)
    const windowSelection = jest
      .spyOn(window, 'getSelection')
      .mockImplementation(() => currentSelection)

    fireEvent.mouseUp(selectionAnchor)
    currentSelection = expandedSelection

    await waitFor(() => {
      expect(screen.getByText('Annotate 2 Words')).toBeInTheDocument()
    })

    documentSelection.mockRestore()
    windowSelection.mockRestore()
  })

  it('handles selection that finalizes after mouse up on a token', async () => {
    await setup()

    const [firstMarkable, secondMarkable] = getMarkableButtons()

    const collapsedSelection = {
      anchorNode: secondMarkable,
      focusNode: secondMarkable,
      isCollapsed: true,
      rangeCount: 0,
      getRangeAt: jest.fn(),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection
    const expandedSelection = {
      anchorNode: firstMarkable,
      focusNode: secondMarkable,
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        startContainer: firstMarkable,
        endContainer: secondMarkable,
      }),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection

    let currentSelection: Selection = collapsedSelection
    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockImplementation(() => currentSelection)
    const windowSelection = jest
      .spyOn(window, 'getSelection')
      .mockImplementation(() => currentSelection)

    fireEvent.mouseUp(secondMarkable)
    currentSelection = expandedSelection

    await waitFor(() => {
      expect(screen.getByText('Annotate 2 Words')).toBeInTheDocument()
    })

    documentSelection.mockRestore()
    windowSelection.mockRestore()
  })

  it('handles cross-token drag when token mouse up resolves one token before Firefox finalizes the range', async () => {
    await setup()

    const [firstMarkable, secondMarkable] = getMarkableButtons()

    const interimSelection = {
      anchorNode: secondMarkable,
      focusNode: secondMarkable,
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        startContainer: secondMarkable,
        endContainer: secondMarkable,
      }),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection
    const expandedSelection = {
      anchorNode: firstMarkable,
      focusNode: secondMarkable,
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        startContainer: firstMarkable,
        endContainer: secondMarkable,
      }),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection

    let currentSelection: Selection = interimSelection
    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockImplementation(() => currentSelection)
    const windowSelection = jest
      .spyOn(window, 'getSelection')
      .mockImplementation(() => currentSelection)

    fireEvent.mouseDown(firstMarkable)
    fireEvent.mouseUp(secondMarkable)
    currentSelection = expandedSelection

    await waitFor(() => {
      expect(screen.getByText('Annotate 2 Words')).toBeInTheDocument()
    })

    documentSelection.mockRestore()
    windowSelection.mockRestore()
  })

  it('selects tokens from range intersections when anchors are not tokens', async () => {
    await setup()

    const markables = getMarkableButtons()
    const words = markables
      .map((markable) => markable.getAttribute('data-id'))
      .filter((id): id is string => !!id)
    const selectionAnchor = screen.getByText('(obverse?!)')

    const range = createRange({
      startContainer: selectionAnchor,
      endContainer: selectionAnchor,
      collapsed: false,
      intersectsNode: (node: Node) =>
        node === markables[0] || node === markables[1],
    })

    const selection = createSelection({
      anchorNode: selectionAnchor,
      focusNode: selectionAnchor,
      isCollapsed: false,
      rangeCount: 1,
      range,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(words)).toEqual([words[0], words[1]])

    documentSelection.mockRestore()
  })

  it('selects tokens from range boundaries when intersections are empty', async () => {
    await setup()

    const markables = getMarkableButtons()
    const words = markables
      .map((markable) => markable.getAttribute('data-id'))
      .filter((id): id is string => !!id)
    const selectionAnchor = screen.getByText('(obverse?!)')

    const range = createRange({
      startContainer: markables[1],
      endContainer: markables[2],
      collapsed: false,
      intersectsNode: () => false,
    })

    const selection = createSelection({
      anchorNode: selectionAnchor,
      focusNode: selectionAnchor,
      isCollapsed: false,
      rangeCount: 1,
      range,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(words)).toEqual(words.slice(1, 3))

    documentSelection.mockRestore()
  })
})
