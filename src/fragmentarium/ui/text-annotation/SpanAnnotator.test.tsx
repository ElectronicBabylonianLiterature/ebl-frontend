import React from 'react'
import SpanAnnotator from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

let container: HTMLElement
const selection = ['Word-1', 'Word-2']
const setSelection = jest.fn()
const testCategory = 'PN: Personal Name'
const mockDispatch = jest.fn()

jest.mock('fragmentarium/ui/text-annotation/TextAnnotationContext', () => ({
  default: {
    Consumer: ({ children }) => children([{ entities: [] }, mockDispatch]),
    Provider: ({ children }) => children,
  },
}))

const mockUseContext = jest.fn()
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: () => mockUseContext(),
}))

describe('SpanAnnotator', () => {
  const setup = (): void => {
    jest.clearAllMocks()
    mockUseContext.mockReturnValue([{ entities: [] }, mockDispatch])
    container = render(
      <SpanAnnotator selection={selection} setSelection={setSelection} />,
    ).container
  }

  it('shows the selection menu', () => {
    setup()
    expect(container).toMatchSnapshot()
  })

  it('shows the options', async () => {
    setup()
    const input = screen.getByLabelText('annotate-named-entities')
    await userEvent.click(input)
    expect(screen.getByText(testCategory)).toBeInTheDocument()
  })

  it('sets the option on click', async () => {
    setup()
    const input = screen.getByLabelText('annotate-named-entities')
    await userEvent.click(input)
    await userEvent.click(screen.getByText(testCategory))
    expect(setSelection).toHaveBeenCalledWith([])
  })

  it('dispatches add action when option is selected', async () => {
    setup()
    const input = screen.getByLabelText('annotate-named-entities')
    await userEvent.click(input)
    await userEvent.click(screen.getByText(testCategory))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'add',
      entity: {
        id: 'Entity-1',
        type: 'PERSONAL_NAME',
        span: selection,
      },
    })
  })
})
