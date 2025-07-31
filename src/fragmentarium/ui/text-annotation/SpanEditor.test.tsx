import React from 'react'
import {
  EntityAnnotationSpan,
  EntityTypes,
} from 'fragmentarium/ui/text-annotation/EntityType'
import { screen, act, render } from '@testing-library/react'
import SpanEditor from 'fragmentarium/ui/text-annotation/SpanEditor'
import userEvent from '@testing-library/user-event'

let container: HTMLElement
const setActiveSpanId = jest.fn()
const mockDispatch = jest.fn()
const buildingName = 'BN: Building Name'

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

const entitySpan: EntityAnnotationSpan = {
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-2'],
  tier: 1,
  name: EntityTypes['PERSONAL_NAME'].name,
}

describe('SpanEditor', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    mockUseContext.mockReturnValue([{ entities: [] }, mockDispatch])
    await act(async () => {
      container = render(
        <SpanEditor entitySpan={entitySpan} setActiveSpanId={setActiveSpanId} />
      ).container
    })
  })
  it('shows the selection menu', () => {
    expect(container).toMatchSnapshot()
  })
  it('updates the annotation', () => {
    const input = screen.getByLabelText('edit-named-entity')
    userEvent.click(input)
    userEvent.click(screen.getByText(buildingName))
    userEvent.click(screen.getByLabelText('update-name-annotation'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'edit',
      entity: {
        id: entitySpan.id,
        type: 'BUILDING_NAME',
        span: entitySpan.span,
      },
    })
  })
  it('deletes the annotation', () => {
    const input = screen.getByLabelText('edit-named-entity')
    userEvent.click(input)
    userEvent.click(screen.getByText(buildingName))
    userEvent.click(screen.getByLabelText('delete-name-annotation'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'delete',
      entity: entitySpan,
    })
  })
})
