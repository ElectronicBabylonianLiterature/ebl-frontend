import { useContext } from 'react'
import type React from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import {
  AnnotationSpan,
  isRealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import RealiaInfoContext from 'fragmentarium/ui/text-annotation/RealiaInfoContext'
import {
  getSpanIndicatorClass,
  getSpanLabel,
} from 'fragmentarium/ui/text-annotation/realiaInfo'
import { openRealiaPageInNewTab } from 'realia/ui/realiaPage'

export const realiaPageHint = 'Alt+click to open the Realia page in a new tab'
export const realiaPageLinkHint = 'Click to open the Realia page in a new tab'

const leftMouseButton = 0

function isRealiaPageShortcut(event: React.MouseEvent): boolean {
  return event.altKey && event.button === leftMouseButton
}

export interface SpanIndicatorPresentation {
  readonly realiaId: string | null
  readonly label: string
  readonly isInitial: boolean
  readonly title: string
  readonly dataLabel: string | undefined
  readonly baseClassName: string
  readonly openRealiaPage: (event: React.MouseEvent) => boolean
  readonly openRealiaPageOnClick: (event: React.MouseEvent) => boolean
}

export function useSpanIndicator(
  entitySpan: AnnotationSpan,
  tokenId?: string,
  hint: string = realiaPageHint,
): SpanIndicatorPresentation {
  const { lookup } = useContext(RealiaInfoContext)
  const realiaId = isRealiaAnnotationSpan(entitySpan)
    ? entitySpan.realiaId
    : null
  const label = getSpanLabel(lookup, entitySpan)
  const isInitial = tokenId === _.first(entitySpan.span)

  function openRealiaPageDirectly(): void {
    openRealiaPageInNewTab(label)
  }

  function openRealiaPage(event: React.MouseEvent): boolean {
    if (!realiaId || !isRealiaPageShortcut(event)) {
      return false
    }
    openRealiaPageDirectly()
    return true
  }

  function openRealiaPageOnClick(event: React.MouseEvent): boolean {
    if (event.button !== leftMouseButton) {
      return false
    }
    openRealiaPageDirectly()
    return true
  }

  return {
    realiaId,
    label,
    isInitial,
    openRealiaPage,
    openRealiaPageOnClick,
    title: realiaId ? `${label} (${hint})` : label,
    dataLabel: realiaId ? label : undefined,
    baseClassName: classNames(
      'span-indicator',
      `tier-depth--${entitySpan.tier}`,
      getSpanIndicatorClass(lookup, entitySpan),
      {
        'span-indicator--realia': !!realiaId,
        initial: isInitial,
        final: tokenId === _.last(entitySpan.span),
      },
    ),
  }
}
