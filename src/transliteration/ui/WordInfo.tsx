import React from 'react'
import { PropsWithChildren } from 'react'
import _ from 'lodash'
import { AnyWord, Token } from 'transliteration/domain/token'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { useDictionary } from 'dictionary/ui/dictionary-context'

import './WordInfo.sass'
import { LineGroup } from './LineGroup'
import { Alignments } from './WordInfoAlignments'
import LemmaInfo from './WordInfoLemmas'
import { isAkkadianWord, isAnyWord } from 'transliteration/domain/type-guards'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'
import AkkadianWordAnalysis from 'akkadian/ui/akkadianWordAnalysis'

function VariantAlignmentIndicator({
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

function PopoverTitle({
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

function hasLemma(token: Token): token is AnyWord {
  return isAnyWord(token) && token.uniqueLemma.length > 0
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

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <PopoverTitle>{children}</PopoverTitle>
      <Popover.Body>
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
  return hasLemma(token) ? (
    <AlignmentInfoPopover
      token={token}
      lineGroup={lineGroup}
      showMeter={showMeter}
      showIpa={showIpa}
    >
      {children}
    </AlignmentInfoPopover>
  ) : (
    <>{children}</>
  )
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

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <PopoverTitle>{children}</PopoverTitle>
      <Popover.Body>
        <LemmaInfo
          word={token}
          dictionary={dictionary}
          manuscriptLines={lineGroup?.manuscriptLines}
        />
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
