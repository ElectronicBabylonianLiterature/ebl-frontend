import { fireEvent, screen, waitFor } from '@testing-library/react'
import FragmentService from 'fragmentarium/application/FragmentService'
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

describe('Named Entity Annotation mouse-up selection', () => {
  it('resets selection when browser selection is collapsed', async () => {
    await setup()

    const [firstMarkable, secondMarkable] = getMarkableButtons()
    const selectionAnchor = screen.getByText('(obverse?!)')

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
    const collapsedSelection = {
      anchorNode: selectionAnchor,
      focusNode: selectionAnchor,
      isCollapsed: true,
      rangeCount: 0,
      getRangeAt: jest.fn(),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(expandedSelection)
    const windowSelection = jest
      .spyOn(window, 'getSelection')
      .mockReturnValue(expandedSelection)

    fireEvent.mouseUp(selectionAnchor)

    await waitFor(() => {
      expect(screen.getByText('Annotate 2 Words')).toBeInTheDocument()
    })

    documentSelection.mockReturnValue(collapsedSelection)
    windowSelection.mockReturnValue(collapsedSelection)

    fireEvent.mouseUp(selectionAnchor)

    await waitFor(() => {
      expect(screen.queryByText('Annotate 2 Words')).not.toBeInTheDocument()
    })

    documentSelection.mockRestore()
    windowSelection.mockRestore()
  })

  it('selects multiple tokens from range boundaries on mouse up', async () => {
    await setup()

    const [firstMarkable, secondMarkable] = getMarkableButtons()
    const selectionAnchor = screen.getByText('(obverse?!)')

    const selection = {
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

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)
    const windowSelection = jest
      .spyOn(window, 'getSelection')
      .mockReturnValue(selection)

    fireEvent.mouseUp(selectionAnchor)

    await waitFor(() => {
      expect(screen.getByText('Annotate 2 Words')).toBeInTheDocument()
    })

    documentSelection.mockRestore()
    windowSelection.mockRestore()
  })

  it('resets selection when no tokens are resolved on mouse up', async () => {
    await setup()

    const [firstMarkable, secondMarkable] = getMarkableButtons()
    const selectionAnchor = screen.getByText('(obverse?!)')

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
    const unresolvedSelection = {
      anchorNode: selectionAnchor,
      focusNode: selectionAnchor,
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        startContainer: selectionAnchor,
        endContainer: selectionAnchor,
      }),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(expandedSelection)
    const windowSelection = jest
      .spyOn(window, 'getSelection')
      .mockReturnValue(expandedSelection)

    fireEvent.mouseUp(selectionAnchor)

    await waitFor(() => {
      expect(screen.getByText('Annotate 2 Words')).toBeInTheDocument()
    })

    documentSelection.mockReturnValue(unresolvedSelection)
    windowSelection.mockReturnValue(unresolvedSelection)

    fireEvent.mouseUp(selectionAnchor)

    await waitFor(() => {
      expect(screen.queryByText('Annotate 2 Words')).not.toBeInTheDocument()
    })

    documentSelection.mockRestore()
    windowSelection.mockRestore()
  })
})
