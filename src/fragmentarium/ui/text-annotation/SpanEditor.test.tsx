import React from 'react'
import {
  EntityAnnotationSpan,
  EntityTypes,
} from 'fragmentarium/ui/text-annotation/EntityType'
import { screen, render } from '@testing-library/react'
import SpanEditor from 'fragmentarium/ui/text-annotation/SpanEditor'
import userEvent from '@testing-library/user-event'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import { ThemeProvider } from 'react-bootstrap'

let container: HTMLElement
const setActiveSpanId = jest.fn()
const mockDispatch = jest.fn()
const buildingName = 'BN: Building Name'

const entitySpan: EntityAnnotationSpan = {
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-2'],
  tier: 1,
  name: EntityTypes['PERSONAL_NAME'].name,
}

describe('SpanEditor', () => {
  const setup = (): void => {
    jest.clearAllMocks()
    container = render(
      <ThemeProvider>
        <AnnotationContext.Provider
          value={[{ entities: [], words: [] }, mockDispatch]}
        >
          <SpanEditor
            entitySpan={entitySpan}
            setActiveSpanId={setActiveSpanId}
          />
        </AnnotationContext.Provider>
      </ThemeProvider>,
    ).container
  }
  it('shows the selection menu', () => {
    setup()
    expect(container).toMatchSnapshot()
  })
  it('updates the annotation', async () => {
    setup()
    const input = screen.getByLabelText('edit-named-entity')
    await userEvent.click(input)
    await userEvent.click(screen.getByText(buildingName))
    await userEvent.click(screen.getByLabelText('update-name-annotation'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'edit',
      entity: {
        id: entitySpan.id,
        type: 'BUILDING_NAME',
        span: entitySpan.span,
      },
    })
  })
  it('deletes the annotation', async () => {
    setup()
    const input = screen.getByLabelText('edit-named-entity')
    await userEvent.click(input)
    await userEvent.click(screen.getByText(buildingName))
    await userEvent.click(screen.getByLabelText('delete-name-annotation'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'delete',
      entity: entitySpan,
    })
  })
})
