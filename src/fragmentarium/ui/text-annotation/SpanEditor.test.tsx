import React from 'react'
import {
  AnnotationSpan,
  DerivedAnnotationSpans,
  EntityAnnotationSpan,
  RealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import { screen, render } from '@testing-library/react'
import SpanEditor from 'fragmentarium/ui/text-annotation/SpanEditor'
import userEvent from '@testing-library/user-event'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import { ThemeProvider } from 'react-bootstrap'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import {
  entityAnnotationSpan,
  mockRealiaSearch,
  realiaAnnotationSpan,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

jest.mock('realia/application/RealiaService')

let container: HTMLElement
const setActiveSpanId = jest.fn()
const mockDispatch = jest.fn()
const buildingName = 'BN: Building Name'

const entitySpan = entityAnnotationSpan({
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-2'],
})

const realiaSpan = realiaAnnotationSpan(
  { id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-2'] },
  { tier: 2 },
)

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
            value={[{ namedEntities: [], realia: [], words: [] }, mockDispatch]}
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
      layer: 'namedEntities',
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
      layer: 'namedEntities',
      id: entitySpan.id,
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
        layer: 'realia',
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
        layer: 'realia',
        id: realiaSpan.id,
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

describe('SpanEditor uniqueness', () => {
  const renderEditor = (
    span: AnnotationSpan,
    annotations: DerivedAnnotationSpans,
  ): void => {
    jest.clearAllMocks()
    mockRealiaSearch([otherRealiaEntry])
    render(
      <ThemeProvider>
        <WithRealiaService>
          <AnnotationContext.Provider
            value={[{ ...annotations, words: [] }, mockDispatch]}
          >
            <SpanEditor entitySpan={span} setActiveSpanId={setActiveSpanId} />
          </AnnotationContext.Provider>
        </WithRealiaService>
      </ThemeProvider>,
    )
  }

  const otherTag: EntityAnnotationSpan = entityAnnotationSpan({
    id: 'Entity-2',
    type: 'BUILDING_NAME',
    span: entitySpan.span,
  })

  it('does not offer a tag already on the same span', async () => {
    renderEditor(entitySpan, {
      namedEntities: [entitySpan, otherTag],
      realia: [],
    })

    await userEvent.click(screen.getByLabelText('edit-named-entity'))

    expect(screen.queryByText(buildingName)).not.toBeInTheDocument()
  })

  it('still offers the tag the span already has', async () => {
    renderEditor(entitySpan, { namedEntities: [entitySpan], realia: [] })

    await userEvent.click(screen.getByLabelText('edit-named-entity'))

    expect(screen.getByText('PN: Personal Name')).toBeInTheDocument()
  })

  it('does not offer a realia already on the same span', async () => {
    const otherRealia: RealiaAnnotationSpan = realiaAnnotationSpan({
      id: 'Realia-2',
      realiaId: otherRealiaEntry.realiaId,
      span: realiaSpan.span,
    })
    renderEditor(realiaSpan, {
      namedEntities: [],
      realia: [realiaSpan, otherRealia],
    })

    await userEvent.type(screen.getByLabelText('edit-realia'), 'Zig')

    expect(await screen.findByText(/no options/i)).toBeInTheDocument()
  })

  it('still offers other realia', async () => {
    renderEditor(realiaSpan, { namedEntities: [], realia: [realiaSpan] })

    await userEvent.type(screen.getByLabelText('edit-realia'), 'Zig')

    expect(await screen.findByText('Ziggurat')).toBeInTheDocument()
  })
})
