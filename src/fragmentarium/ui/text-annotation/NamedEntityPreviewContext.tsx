import React, { Context, PropsWithChildren, useMemo } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  EntityAnnotationSpan,
  RealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  createFragmentAnnotationSpans,
  getWordIds,
} from 'fragmentarium/ui/text-annotation/fragmentSpans'
import { emptyRealiaInfoEntries } from 'fragmentarium/ui/text-annotation/realiaInfo'
import RealiaInfoContext, {
  useRealiaInfoService,
} from 'fragmentarium/ui/text-annotation/RealiaInfoContext'
import { setTiers } from 'fragmentarium/ui/text-annotation/spanTiers'

export interface NamedEntityPreview {
  readonly namedEntities: readonly EntityAnnotationSpan[]
  readonly realia: readonly RealiaAnnotationSpan[]
}

export const emptyNamedEntityPreview: NamedEntityPreview = {
  namedEntities: [],
  realia: [],
}

const NamedEntityPreviewContext: Context<NamedEntityPreview> =
  React.createContext<NamedEntityPreview>(emptyNamedEntityPreview)

export function NamedEntityPreviewProvider({
  fragment,
  children,
}: PropsWithChildren<{ fragment: Fragment }>): JSX.Element {
  const spans = useMemo(
    () => createFragmentAnnotationSpans(fragment),
    [fragment],
  )
  const derivedSpans = useMemo(
    () => setTiers(getWordIds(fragment.text), spans),
    [fragment.text, spans],
  )
  const realiaInfoService = useRealiaInfoService(
    fragment.realiaInfo ?? emptyRealiaInfoEntries,
  )

  return (
    <RealiaInfoContext.Provider value={realiaInfoService}>
      <NamedEntityPreviewContext.Provider value={derivedSpans}>
        {children}
      </NamedEntityPreviewContext.Provider>
    </RealiaInfoContext.Provider>
  )
}

export default NamedEntityPreviewContext
