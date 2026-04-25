import React from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { tokenIdFragment } from 'test-support/fragment-fixtures'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'react-bootstrap'
import { getSelectedTokens } from 'fragmentarium/ui/text-annotation/selectionUtils'

jest.mock('react-bootstrap', () => {
  const actual = jest.requireActual('react-bootstrap')
  return {
    ...actual,
    Overlay: ({
      children,
      show,
    }: {
      children:
        | React.ReactNode
        | ((props: Record<string, unknown>) => React.ReactNode)
      show?: boolean
    }) => {
      if (!show) {
        return null
      }

      if (typeof children === 'function') {
        return <>{children({})}</>
      }

      return <>{children}</>
    },
  }
})

jest.mock('fragmentarium/application/FragmentService')
const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentServiceMock = new MockFragmentService()
let container: HTMLElement
const number = tokenIdFragment.number

const testAnnotations: readonly ApiEntityAnnotationSpan[] = [
  {
    id: 'Entity-1',
    type: 'PERSONAL_NAME',
    span: ['Word-2'],
  },
  {
    id: 'Entity-2',
    type: 'BUILDING_NAME',
    span: ['Word-2', 'Word-3'],
  },
  {
    id: 'Entity-3',
    type: 'YEAR_NAME',
    span: ['Word-4', 'Word-5', 'Word-6', 'Word-10'],
  },
]

type SelectionConfig = {
  anchorNode: Node
  focusNode: Node
  isCollapsed: boolean
  rangeCount: number
  range: Range | null
}

const createSelection = ({
  anchorNode,
  focusNode,
  isCollapsed,
  rangeCount,
  range,
}: SelectionConfig): Selection =>
  ({
    anchorNode,
    focusNode,
    isCollapsed,
    rangeCount,
    getRangeAt: jest.fn().mockReturnValue(range),
    empty: jest.fn(),
    removeAllRanges: jest.fn(),
  }) as unknown as Selection

const createRange = ({
  startContainer,
  endContainer,
  collapsed,
  intersectsNode,
}: {
  startContainer: Node
  endContainer: Node
  collapsed: boolean
  intersectsNode: (node: Node) => boolean
}): Range =>
  ({
    startContainer,
    endContainer,
    collapsed,
    intersectsNode,
  }) as unknown as Range

const renderSelectionFixture = () => {
  render(
    <div>
      <span className="markable" data-id="Word-1">
        first
      </span>
      <span data-testid="separator"> </span>
      <span className="markable" data-id="Word-2">
        second
      </span>
      <span className="markable" data-id="Word-3">
        third
      </span>
    </div>,
  )

  const markables = screen.getAllByText(/first|second|third/)
  const separator = screen.getByTestId('separator')

  return {
    words: ['Word-1', 'Word-2', 'Word-3'],
    markables,
    separator,
  }
}

describe('Named Entity Annotation', () => {
  const setup = async (): Promise<void> => {
    fragmentServiceMock.find.mockResolvedValue(tokenIdFragment)
    fragmentServiceMock.fetchNamedEntityAnnotations.mockResolvedValue(
      testAnnotations,
    )
    fragmentServiceMock.updateNamedEntityAnnotations.mockResolvedValue(
      tokenIdFragment,
    )
    container = render(
      <ThemeProvider>
        <TextAnnotation fragmentService={fragmentServiceMock} number={number} />
      </ThemeProvider>,
    ).container
    await screen.findByLabelText('save-annotations')
  }

  const getMarkableButtons = (): HTMLElement[] => {
    return screen
      .getAllByRole('button')
      .filter((button) => button.hasAttribute('data-id')) as HTMLElement[]
  }
  it('shows the annotation interface', async () => {
    await setup()
    expect(container).toMatchSnapshot()
  })
  it.each(
    testAnnotations.flatMap((annotation) =>
      annotation.span.map((wordId) => [`${wordId}__${annotation.id}`]),
    ),
  )('shows the named entity annotation for %s', async (testId) => {
    await setup()
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })
  it('calls updateNamedEntityAnnotations on save', async () => {
    await setup()
    const saveButton = screen.getByLabelText('save-annotations')
    await userEvent.click(screen.getByTestId('Word-2__Entity-1'))
    await screen.findByLabelText('delete-name-annotation')
    await userEvent.click(screen.getByLabelText('delete-name-annotation'))

    await userEvent.click(saveButton)
    expect(
      fragmentServiceMock.updateNamedEntityAnnotations,
    ).toHaveBeenCalledWith(
      number,
      testAnnotations.filter((entity) => entity.id !== 'Entity-1'),
    )
  })

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

  it('returns an empty selection when browser selection is unavailable', () => {
    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(null)

    expect(getSelectedTokens(['Word-1'])).toEqual([])

    documentSelection.mockRestore()
  })

  it('returns an empty selection when selection nodes are missing', () => {
    const selection = {
      anchorNode: null,
      focusNode: null,
      isCollapsed: false,
      rangeCount: 0,
      getRangeAt: jest.fn(),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(['Word-1'])).toEqual([])

    documentSelection.mockRestore()
  })

  it('returns an empty selection when selection is collapsed and has no range', () => {
    const { separator, words } = renderSelectionFixture()
    const selection = createSelection({
      anchorNode: separator,
      focusNode: separator,
      isCollapsed: true,
      rangeCount: 0,
      range: null,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(words)).toEqual([])

    documentSelection.mockRestore()
  })

  it('returns an empty selection when a collapsed range is reported', () => {
    const { separator, words } = renderSelectionFixture()
    const range = createRange({
      startContainer: separator,
      endContainer: separator,
      collapsed: true,
      intersectsNode: () => false,
    })
    const selection = createSelection({
      anchorNode: separator,
      focusNode: separator,
      isCollapsed: true,
      rangeCount: 1,
      range,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(words)).toEqual([])

    documentSelection.mockRestore()
  })

  it('returns an empty selection when sibling fallback finds no markable', () => {
    render(<span data-testid="outside">outside</span>)

    const outside = screen.getByTestId('outside')
    const selection = createSelection({
      anchorNode: outside,
      focusNode: outside,
      isCollapsed: false,
      rangeCount: 0,
      range: null,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(['Word-1'])).toEqual([])

    documentSelection.mockRestore()
  })

  it('falls back to range boundaries when intersectsNode throws', () => {
    const { markables, words } = renderSelectionFixture()
    const outside = document.createTextNode('outside')
    const range = createRange({
      startContainer: markables[0],
      endContainer: markables[1],
      collapsed: false,
      intersectsNode: () => {
        throw new Error('intersectsNode failed')
      },
    })
    const selection = createSelection({
      anchorNode: outside,
      focusNode: outside,
      isCollapsed: false,
      rangeCount: 1,
      range,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(words)).toEqual(words.slice(0, 2))

    documentSelection.mockRestore()
  })

  it('falls back to range boundaries when selection is collapsed but range is expanded', () => {
    const { markables, words } = renderSelectionFixture()
    const outside = document.createTextNode('outside')
    const range = createRange({
      startContainer: markables[0],
      endContainer: markables[1],
      collapsed: false,
      intersectsNode: () => false,
    })
    const selection = createSelection({
      anchorNode: outside,
      focusNode: outside,
      isCollapsed: true,
      rangeCount: 1,
      range,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(words)).toEqual(words.slice(0, 2))

    documentSelection.mockRestore()
  })

  it('returns an empty selection when resolved token ids are missing from words', () => {
    const { markables } = renderSelectionFixture()
    const selection = createSelection({
      anchorNode: markables[2],
      focusNode: markables[2],
      isCollapsed: false,
      rangeCount: 0,
      range: null,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(['Word-1', 'Word-2'])).toEqual([])

    documentSelection.mockRestore()
  })
})
