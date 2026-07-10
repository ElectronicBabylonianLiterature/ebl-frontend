import React from 'react'
import { EntityTypes } from 'fragmentarium/ui/text-annotation/EntityType'
import {
  EntityAnnotationSpan,
  RealiaAnnotationSpan,
  AnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import { screen, render } from '@testing-library/react'
import SpanEditor from 'fragmentarium/ui/text-annotation/SpanEditor'
import userEvent from '@testing-library/user-event'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import { ThemeProvider } from 'react-bootstrap'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import {
  mockRealiaSearch,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

jest.mock('realia/application/RealiaService')

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

const realiaSpan: RealiaAnnotationSpan = {
  id: 'Realia-1',
  realiaId: 'realia_000846',
  span: ['Word-2'],
  tier: 2,
  name: 'realia_000846',
}

const otherRealiaEntry = realiaEntryFactory.build({
  id: 'Ziggurat',
  realiaId: 'realia_000999',
})

describe('SpanEditor', () => {
  const setup = (span: AnnotationSpan = entitySpan): void => {
    jest.clearAllMocks()
    mockRealiaSearch([otherRealiaEntry])
    container = render(
      <ThemeProvider>
        <WithRealiaService>
          <AnnotationContext.Provider
            value={[{ annotations: [], words: [] }, mockDispatch]}
          >
            <SpanEditor entitySpan={span} setActiveSpanId={setActiveSpanId} />
          </AnnotationContext.Provider>
        </WithRealiaService>
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
      annotation: {
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
      annotation: entitySpan,
    })
  })

  describe('realia layer', () => {
    it('shows the realia editor for a realia span', () => {
      setup(realiaSpan)
      expect(screen.getByLabelText('edit-realia')).toBeInTheDocument()
      expect(
        screen.queryByLabelText('edit-named-entity'),
      ).not.toBeInTheDocument()
    })

    it('keeps the current realiaId as the selected value', () => {
      setup(realiaSpan)
      expect(screen.getByText('realia_000846')).toBeInTheDocument()
    })

    it('updates the realiaId', async () => {
      setup(realiaSpan)
      const input = screen.getByLabelText('edit-realia')
      await userEvent.type(input, 'Zig')
      await userEvent.click(await screen.findByText('Ziggurat'))
      await userEvent.click(screen.getByLabelText('update-name-annotation'))

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'edit',
        annotation: {
          id: realiaSpan.id,
          span: realiaSpan.span,
          realiaId: 'realia_000999',
        },
      })
      expect(setActiveSpanId).toHaveBeenCalledWith(null)
    })

    it('deletes a realia span', async () => {
      setup(realiaSpan)
      await userEvent.click(screen.getByLabelText('delete-name-annotation'))

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'delete',
        annotation: realiaSpan,
      })
    })

    it('does not dispatch when the realia selection is cleared', async () => {
      setup(realiaSpan)
      await userEvent.type(screen.getByLabelText('edit-realia'), '{backspace}')
      await userEvent.click(screen.getByLabelText('update-name-annotation'))

      expect(mockDispatch).not.toHaveBeenCalled()
      expect(setActiveSpanId).not.toHaveBeenCalled()
    })
  })
})
