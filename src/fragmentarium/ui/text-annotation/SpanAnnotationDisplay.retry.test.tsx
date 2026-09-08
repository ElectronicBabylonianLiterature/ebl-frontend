import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { tokenIdFragment } from 'test-support/fragment-fixtures'

jest.mock('fragmentarium/application/FragmentService')

const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

function createSingleTokenSelection(markable: HTMLElement): Selection {
  return {
    anchorNode: markable,
    focusNode: markable,
    isCollapsed: false,
    rangeCount: 1,
    getRangeAt: jest
      .fn()
      .mockReturnValue({ startContainer: markable, endContainer: markable }),
    empty: jest.fn(),
    removeAllRanges: jest.fn(),
  } as unknown as Selection
}

async function renderAnnotation(): Promise<void> {
  jest.clearAllMocks()
  fragmentServiceMock.find.mockResolvedValue(tokenIdFragment)
  fragmentServiceMock.fetchNamedEntityAnnotations.mockResolvedValue([])
  render(
    <ThemeProvider>
      <TextAnnotation
        fragmentService={fragmentServiceMock}
        number={tokenIdFragment.number}
      />
    </ThemeProvider>,
  )
  await screen.findByLabelText('save-annotations')
}

test('A selection that started on another token is re-read before it is applied', async () => {
  await renderAnnotation()

  const markables = screen
    .getAllByRole('button')
    .filter((button) => button.hasAttribute('data-id'))
  const [firstMarkable, secondMarkable] = markables

  const selection = createSingleTokenSelection(secondMarkable)
  const documentSelection = jest
    .spyOn(document, 'getSelection')
    .mockImplementation(() => selection)
  const windowSelection = jest
    .spyOn(window, 'getSelection')
    .mockImplementation(() => selection)

  fireEvent.mouseDown(firstMarkable)
  fireEvent.mouseUp(secondMarkable)

  await waitFor(() => {
    expect(screen.getByText('Annotate 1 Word')).toBeInTheDocument()
  })

  documentSelection.mockRestore()
  windowSelection.mockRestore()
})
