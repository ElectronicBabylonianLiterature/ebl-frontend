import React from 'react'
import { PropsWithChildren } from 'react'
import _ from 'lodash'
import { AnyWord, Token } from 'transliteration/domain/token'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { useDictionary } from 'dictionary/ui/dictionary-context'

import './WordInfo.sass'
import { LineGroup } from './LineGroup'
import LemmaInfo from './WordInfoLemmas'
import { isAnyWord } from 'transliteration/domain/type-guards'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'
import { LineLemmasContext, useLineLemmasContext } from './LineLemmasContext'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'

export function VariantAlignmentIndicator({
  children,
  token,
}: {
  children: React.ReactNode
  token: Token
}): JSX.Element {
  return (
    <>
      {children}
      {isAnyWord(token) &&
      (token.hasVariantAlignment || token.hasOmittedAlignment) ? (
        <sup className="word-info__variant-alignment-indicator">‡</sup>
      ) : null}
    </>
  )
}

export function PopoverTitle({
  children,
}: {
  children?: React.ReactNode | undefined
}): JSX.Element {
  return (
    <Popover.Header>
      <span className={'word-info__header'}>{children}</span>
    </Popover.Header>
  )
}

export function hasLemma(token: Token): token is AnyWord {
  return isAnyWord(token) && token.uniqueLemma.length > 0
}

function LemmaInfoPopover({
  token,
  children,
  lineGroup,
}: PropsWithChildren<{
  token: AnyWord
  lineGroup?: LineGroup
}>): JSX.Element {
  const dictionary = useDictionary()
  const { lemmaMap, lemmaSetter } = useLineLemmasContext()

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <PopoverTitle>{children}</PopoverTitle>
      <Popover.Body>
        <LineLemmasContext.Provider
          value={{
            lemmaMap: lemmaMap,
            lemmaSetter: lemmaSetter,
          }}
        >
          <LemmaInfo
            word={token}
            dictionary={dictionary}
            manuscriptLines={lineGroup?.manuscriptLines}
          />
        </LineLemmasContext.Provider>
      </Popover.Body>
    </Popover>
  )

  return (
    <span className={'word-info__wrapper'}>
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="top"
        overlay={popover}
      >
        <span className="word-info__trigger" role="button">
          <VariantAlignmentIndicator token={token}>
            {children}
          </VariantAlignmentIndicator>
        </span>
      </OverlayTrigger>
    </span>
  )
}

export function LemmaPopover({
  token,
  children,
  lineGroup,
}: TokenActionWrapperProps & {
  lineGroup?: LineGroup
}): JSX.Element {
  const useRouterLinks = React.useContext(RouterLinkModeContext)

  if (!useRouterLinks) {
    return (
      <VariantAlignmentIndicator token={token}>
        {children}
      </VariantAlignmentIndicator>
    )
  }

  return hasLemma(token) ? (
    <LemmaInfoPopover token={token} lineGroup={lineGroup}>
      {children}
    </LemmaInfoPopover>
  ) : (
    <VariantAlignmentIndicator token={token}>
      {children}
    </VariantAlignmentIndicator>
  )
}
