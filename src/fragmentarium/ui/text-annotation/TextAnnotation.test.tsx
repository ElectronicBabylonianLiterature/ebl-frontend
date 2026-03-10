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
    await waitFor(async () => {
      await userEvent.click(screen.getByTestId('Word-2__Entity-1'))

      expect(
        screen.getByLabelText('delete-name-annotation'),
      ).toBeInTheDocument()
    })
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
})
