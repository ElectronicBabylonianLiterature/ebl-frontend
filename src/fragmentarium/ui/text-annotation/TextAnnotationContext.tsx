import {
  AnnotationLayer,
  AnnotationSpans,
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
  dedupeEntitySpans,
  dedupeRealiaSpans,
  DerivedAnnotationSpans,
  emptyAnnotationSpans,
  isDuplicateEntitySpan,
  isDuplicateRealiaSpan,
  NAMED_ENTITY_LAYER,
  REALIA_LAYER,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import { setTiers } from 'fragmentarium/ui/text-annotation/spanTiers'
import React, { Dispatch, useReducer } from 'react'

type State = DerivedAnnotationSpans & {
  words: readonly string[]
}
export type AnnotationContextService = [State, Dispatch<Action>]

type EntityPayload = {
  layer: typeof NAMED_ENTITY_LAYER
  annotation: ApiEntityAnnotationSpan
}
type RealiaPayload = {
  layer: typeof REALIA_LAYER
  annotation: ApiRealiaAnnotationSpan
}
type UpsertPayload = EntityPayload | RealiaPayload

export type Action =
  | ({ type: 'add' } & UpsertPayload)
  | ({ type: 'edit' } & UpsertPayload)
  | { type: 'delete'; layer: typeof NAMED_ENTITY_LAYER; id: string }
  | { type: 'delete'; layer: typeof REALIA_LAYER; id: string }

const AnnotationContext = React.createContext<AnnotationContextService>([
  { namedEntities: [], realia: [], words: [] },
  () => {},
])

function toApiSpans(state: State): AnnotationSpans {
  return { namedEntities: state.namedEntities, realia: state.realia }
}

function derive(state: State, spans: AnnotationSpans): State {
  return { ...setTiers(state.words, spans), words: state.words }
}

function upsert<Span extends { id: string }>(
  spans: readonly Span[],
  annotation: Span,
  replace: boolean,
  isDuplicate: (others: readonly Span[], candidate: Span) => boolean,
): readonly Span[] {
  const others = replace
    ? spans.filter((span) => span.id !== annotation.id)
    : spans

  return isDuplicate(others, annotation) ? spans : [...others, annotation]
}

function applyUpsert(
  state: State,
  action: UpsertPayload,
  replace: boolean,
): State {
  const spans = toApiSpans(state)

  return derive(
    state,
    action.layer === REALIA_LAYER
      ? {
          ...spans,
          realia: upsert(
            spans.realia,
            action.annotation,
            replace,
            isDuplicateRealiaSpan,
          ),
        }
      : {
          ...spans,
          namedEntities: upsert(
            spans.namedEntities,
            action.annotation,
            replace,
            isDuplicateEntitySpan,
          ),
        },
  )
}

function applyDelete(state: State, layer: AnnotationLayer, id: string): State {
  const spans = toApiSpans(state)

  return derive(
    state,
    layer === REALIA_LAYER
      ? { ...spans, realia: spans.realia.filter((span) => span.id !== id) }
      : {
          ...spans,
          namedEntities: spans.namedEntities.filter((span) => span.id !== id),
        },
  )
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return applyUpsert(state, action, false)
    case 'edit':
      return applyUpsert(state, action, true)
    case 'delete':
      return applyDelete(state, action.layer, action.id)
  }
}

export function useAnnotationContext(
  words: readonly string[],
  initial: AnnotationSpans = emptyAnnotationSpans,
): AnnotationContextService {
  const deduped: AnnotationSpans = {
    namedEntities: dedupeEntitySpans(initial.namedEntities),
    realia: dedupeRealiaSpans(initial.realia),
  }

  return useReducer(reducer, { ...setTiers(words, deduped), words })
}

export default AnnotationContext
