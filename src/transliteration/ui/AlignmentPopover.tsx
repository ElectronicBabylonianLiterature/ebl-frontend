import React from 'react'
import { PropsWithChildren } from 'react'
import _ from 'lodash'
import { AnyWord } from 'transliteration/domain/token'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { useDictionary } from 'dictionary/ui/dictionary-context'

import { LineGroup } from './LineGroup'
import { Alignments } from './WordInfoAlignments'
import LemmaInfo from './WordInfoLemmas'
import { isAkkadianWord, isAnyWord } from 'transliteration/domain/type-guards'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'
import AkkadianWordAnalysis from 'akkadian/ui/akkadianWordAnalysis'
import { LineLemmasContext, useLineLemmasContext } from './LineLemmasContext'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import { VariantAlignmentIndicator, PopoverTitle, hasLemma } from './WordInfo'

function AlignmentHoverTrigger({
  token,
  lineGroup,
  children,
}: PropsWithChildren<{
  token: AnyWord
  lineGroup: LineGroup
}>): JSX.Element {
  return (
    <span
      className="word-info__hover-trigger"
      onMouseEnter={() =>
        lineGroup.setActiveTokenIndex(token.sentenceIndex || 0)
      }
      onMouseLeave={() => lineGroup.setActiveTokenIndex(0)}
    >
      <VariantAlignmentIndicator token={token}>
        {children}
      </VariantAlignmentIndicator>
    </span>
  )
}

function AlignmentInfoPopover({
  token,
  lineGroup,
  showMeter,
  showIpa,
  children,
}: PropsWithChildren<{
  token: AnyWord
  lineGroup: LineGroup
  showMeter: boolean
  showIpa: boolean
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
            manuscriptLines={lineGroup.manuscriptLines}
          />
          <Alignments
            tokenIndex={token.sentenceIndex}
            lemma={token.uniqueLemma}
            lineGroup={lineGroup}
            dictionary={dictionary}
          />
        </LineLemmasContext.Provider>
      </Popover.Body>
    </Popover>
  )

  return (
    <span className={'word-info__wrapper word-info__alignment-trigger'}>
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="top"
        overlay={popover}
      >
        <span
          className="word-info__trigger"
          role="button"
          onMouseEnter={() =>
            lineGroup.setActiveTokenIndex(token.sentenceIndex || 0)
          }
          onMouseLeave={() => lineGroup.setActiveTokenIndex(0)}
        >
          <VariantAlignmentIndicator token={token}>
            {children}
          </VariantAlignmentIndicator>
        </span>
      </OverlayTrigger>
      {isAkkadianWord(token) && (
        <AkkadianWordAnalysis
          word={token}
          showMeter={showMeter}
          showIpa={showIpa}
        />
      )}
    </span>
  )
}

export function AlignmentPopover({
  token,
  children,
  showMeter = false,
  showIpa = false,
  lineGroup,
}: TokenActionWrapperProps & {
  lineGroup: LineGroup
  showMeter?: boolean
  showIpa?: boolean
}): JSX.Element {
  const useRouterLinks = React.useContext(RouterLinkModeContext)

  if (!useRouterLinks) {
    return (
      <VariantAlignmentIndicator token={token}>
        {children}
      </VariantAlignmentIndicator>
    )
  }

  if (hasLemma(token)) {
    return (
      <AlignmentInfoPopover
        token={token}
        lineGroup={lineGroup}
        showMeter={showMeter}
        showIpa={showIpa}
      >
        {children}
      </AlignmentInfoPopover>
    )
  }

  return isAnyWord(token) ? (
    <AlignmentHoverTrigger token={token} lineGroup={lineGroup}>
      {children}
    </AlignmentHoverTrigger>
  ) : (
    <>{children}</>
  )
}
