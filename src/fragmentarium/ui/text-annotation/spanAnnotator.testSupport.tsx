import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SpanAnnotator from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import {
  DerivedAnnotationSpans,
  EntityAnnotationSpan,
  RealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import {
  entityAnnotationSpan,
  mockRealiaSearch,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

export const selection = ['Word-1', 'Word-2']
export const setSelection = jest.fn()
export const mockDispatch = jest.fn()
export const testCategory = 'PN: Personal Name'

export const realiaEntry = realiaEntryFactory.build({
  id: 'Apkallu',
  realiaId: 'realia_000846',
  type: ['Divine names'],
})

export const unmappedRealiaEntry = realiaEntryFactory.build({
  id: 'Ziggurat',
  realiaId: 'realia_000999',
  type: ['Literature'],
})

export const existingTag: EntityAnnotationSpan = entityAnnotationSpan({
  id: 'Entity-3',
  type: 'ROYAL_NAME',
  span: selection,
})

export function stateOf(
  namedEntities: readonly EntityAnnotationSpan[] = [],
  realia: readonly RealiaAnnotationSpan[] = [],
): DerivedAnnotationSpans {
  return { namedEntities, realia }
}

export function setupSpanAnnotator(
  annotations: DerivedAnnotationSpans = stateOf(),
  entries = [realiaEntry],
): HTMLElement {
  jest.clearAllMocks()
  mockRealiaSearch(entries)
  return render(
    <WithRealiaService>
      <AnnotationContext.Provider
        value={[{ ...annotations, words: [] }, mockDispatch]}
      >
        <SpanAnnotator selection={selection} setSelection={setSelection} />
      </AnnotationContext.Provider>
    </WithRealiaService>,
  ).container
}

export const selectRealia = async (label = 'Apkallu'): Promise<void> => {
  await userEvent.type(
    screen.getByLabelText('annotate-realia'),
    label.slice(0, 3),
  )
  await userEvent.click(await screen.findByText(label))
}
