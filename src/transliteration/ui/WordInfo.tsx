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
import { isAnyWord } from 'transliteration/domain/type-guards'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'
import { OverlayChildren } from 'react-bootstrap/esm/Overlay'
import classNames from 'classnames'

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
    <Popover.Title>
      <span className={'word-info__header'}>{children}</span>
    </Popover.Title>
  )
}

function hasLemma(token: Token): token is AnyWord {
  return isAnyWord(token) && token.uniqueLemma.length > 0
}

function WordInfoTrigger({
  overlay,
  children,
  onMouseEnter,
  onMouseLeave,
  token,
  className,
}: {
  overlay: OverlayChildren
  children: React.ReactNode
  token: Token
} & Pick<
  React.HTMLProps<HTMLSpanElement>,
  'onMouseEnter' | 'onMouseLeave' | 'className'
>): JSX.Element {
  return (
    <span className={classNames('word-info__wrapper', className)}>
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="top"
        overlay={overlay}
      >
        <span
          className="word-info__trigger"
          role="button"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <VariantAlignmentIndicator token={token}>
            {children}
          </VariantAlignmentIndicator>
        </span>
      </OverlayTrigger>
    </span>
  )
}

export function AlignmentInfoPopover({
  token,
  lineGroup,
  children,
}: PropsWithChildren<{
  token: AnyWord
  lineGroup: LineGroup
}>): JSX.Element {
  const dictionary = useDictionary()

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <PopoverTitle>{children}</PopoverTitle>
      <Popover.Content>
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
      </Popover.Content>
    </Popover>
  )

  return (
    <WordInfoTrigger
      overlay={popover}
      token={token}
      onMouseEnter={() =>
        lineGroup.setActiveTokenIndex(token.sentenceIndex || 0)
      }
      onMouseLeave={() => lineGroup.setActiveTokenIndex(0)}
      className="word-info__alignment-trigger"
    >
      {children}
    </WordInfoTrigger>
  )
}

export function AlignmentPopover({
  token,
  children,
  lineGroup,
}: TokenActionWrapperProps & {
  lineGroup: LineGroup
}): JSX.Element {
  return hasLemma(token) ? (
    <AlignmentInfoPopover token={token} lineGroup={lineGroup}>
      {children}
    </AlignmentInfoPopover>
  ) : (
    <VariantAlignmentIndicator token={token}>
      {children}
    </VariantAlignmentIndicator>
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
      <Popover.Content>
        <LemmaInfo
          word={token}
          dictionary={dictionary}
          manuscriptLines={lineGroup?.manuscriptLines}
        />
      </Popover.Content>
    </Popover>
  )

  return (
    <WordInfoTrigger overlay={popover} token={token}>
      {children}
    </WordInfoTrigger>
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
