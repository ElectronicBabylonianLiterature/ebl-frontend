import React from 'react'
import Bluebird from 'bluebird'
import RealiaService from 'realia/application/RealiaService'
import RealiaServiceContext from 'realia/application/RealiaServiceContext'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import {
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
  DerivedSpanFields,
  EntityAnnotationSpan,
  RealiaAnnotationSpan,
  tagEntitySpan,
  tagRealiaSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import { EntityTypes } from 'fragmentarium/ui/text-annotation/EntityType'

export function entityAnnotationSpan(
  span: ApiEntityAnnotationSpan,
  derived: Partial<DerivedSpanFields> = {},
): EntityAnnotationSpan {
  return {
    ...tagEntitySpan(span),
    tier: derived.tier ?? 1,
    name: derived.name ?? EntityTypes[span.type].name,
  }
}

export function realiaAnnotationSpan(
  span: ApiRealiaAnnotationSpan,
  derived: Partial<DerivedSpanFields> = {},
): RealiaAnnotationSpan {
  return {
    ...tagRealiaSpan(span),
    tier: derived.tier ?? 1,
    name: derived.name ?? span.realiaId,
  }
}

export const realiaServiceMock = new (RealiaService as jest.Mock<
  jest.Mocked<RealiaService>
>)()

export function mockRealiaSearch(entries: readonly RealiaEntry[]): void {
  realiaServiceMock.search.mockReturnValue(Bluebird.resolve(entries))
}

export function WithRealiaService({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <RealiaServiceContext.Provider value={realiaServiceMock}>
      {children}
    </RealiaServiceContext.Provider>
  )
}
