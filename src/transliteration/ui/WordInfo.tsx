import React, { FunctionComponent } from 'react'
import { PropsWithChildren } from 'react'
import _ from 'lodash'
import { LemmatizableToken, Token } from 'transliteration/domain/token'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { useDictionary } from 'dictionary/ui/dictionary-context'
import classNames from 'classnames'

import './WordInfo.sass'
import { LineGroup } from './LineGroup'
import { Alignments } from './WordInfoAlignments'
import LemmaInfo from './WordInfoLemmas'
import { isAnyWord } from 'transliteration/domain/type-guards'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'

function VariantAlignmentIndicator({
  token,
}: {
  token: LemmatizableToken
}): JSX.Element | null {
  return token.hasVariantAlignment || token.hasOmittedAlignment ? (
    <sup className="word-info__variant-alignment-indicator">‡</sup>
  ) : null
}

function ReconstructionPopover({
  word,
  tokenClasses = [],
  lineGroup,
  children,
}: PropsWithChildren<{
  word: LemmatizableToken
  tokenClasses?: readonly string[]
  lineGroup: LineGroup
}>): JSX.Element {
  const dictionary = useDictionary()

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <Popover.Title>
        <span className={classNames(['word-info__header', ...tokenClasses])}>
          {children}
        </span>
      </Popover.Title>
      <Popover.Content>
        <>
          <LemmaInfo
            word={word}
            dictionary={dictionary}
            manuscriptLines={lineGroup.manuscriptLines}
          />
          <Alignments
            tokenIndex={word.sentenceIndex}
            lemma={word.uniqueLemma}
            lineGroup={lineGroup}
            dictionary={dictionary}
          />
        </>
      </Popover.Content>
    </Popover>
  )

  return (
    <span className="word-info__wrapper">
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="top"
        overlay={popover}
      >
        <span
          className="word-info__trigger"
          onMouseEnter={() =>
            lineGroup.setActiveTokenIndex(word.sentenceIndex || 0)
          }
          onMouseLeave={() => lineGroup.setActiveTokenIndex(0)}
          role="button"
        >
          {children}
        </span>
      </OverlayTrigger>
      <VariantAlignmentIndicator token={word} />
    </span>
  )
}

function ManuscriptInfoPopover({
  word,
  tokenClasses = [],
  lineGroup,
  children,
}: PropsWithChildren<{
  word: LemmatizableToken
  tokenClasses?: readonly string[]
  lineGroup: LineGroup
}>): JSX.Element {
  const dictionary = useDictionary()

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <Popover.Title>
        <span className={classNames(['word-info__header', ...tokenClasses])}>
          {children}
        </span>
      </Popover.Title>
      <Popover.Content>
        <>
          <LemmaInfo
            word={word}
            dictionary={dictionary}
            manuscriptLines={lineGroup.manuscriptLines}
          />
        </>
      </Popover.Content>
    </Popover>
  )

  return (
    <span className="word-info__wrapper">
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="top"
        overlay={popover}
      >
        <span className="word-info__trigger" role="button">
          {children}
        </span>
      </OverlayTrigger>
      <VariantAlignmentIndicator token={word} />
    </span>
  )
}

function LemmaInfoPopover({
  word,
  tokenClasses = [],
  children,
}: PropsWithChildren<{
  word: LemmatizableToken
  tokenClasses?: readonly string[]
}>): JSX.Element {
  const dictionary = useDictionary()

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <Popover.Title>
        <span className={classNames(['word-info__header', ...tokenClasses])}>
          {children}
        </span>
      </Popover.Title>
      <Popover.Content>
        <>
          <LemmaInfo word={word} dictionary={dictionary} />
        </>
      </Popover.Content>
    </Popover>
  )

  return (
    <span className="word-info__wrapper">
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="top"
        overlay={popover}
      >
        <span className="word-info__trigger" role="button">
          {children}
        </span>
      </OverlayTrigger>
      <VariantAlignmentIndicator token={word} />
    </span>
  )
}

export function LemmaPopover({
  token,
  children,
}: PropsWithChildren<{
  token: Token
}>): JSX.Element {
  return isAnyWord(token) ? (
    token.uniqueLemma.length > 0 ? (
      <LemmaInfoPopover word={token}>{children}</LemmaInfoPopover>
    ) : (
      <>
        {children}
        <VariantAlignmentIndicator token={token} />
      </>
    )
  ) : (
    <>{children}</>
  )
}

export function createManuscriptInfoPopover(
  lineGroup: LineGroup
): FunctionComponent<TokenActionWrapperProps> {
  const WordInfoPopover = ({
    token,
    children,
  }: PropsWithChildren<{
    token: Token
  }>): JSX.Element => {
    return isAnyWord(token) ? (
      token.uniqueLemma.length > 0 ? (
        <ManuscriptInfoPopover word={token} lineGroup={lineGroup}>
          {children}
        </ManuscriptInfoPopover>
      ) : (
        <>
          {children}
          <VariantAlignmentIndicator token={token} />
        </>
      )
    ) : (
      <>{children}</>
    )
  }
  return WordInfoPopover
}

export function createReconstructionInfoPopover(
  lineGroup: LineGroup
): FunctionComponent<TokenActionWrapperProps> {
  const WordInfoPopover = ({
    token,
    children,
  }: PropsWithChildren<{
    token: Token
  }>): JSX.Element => {
    return isAnyWord(token) ? (
      token.uniqueLemma.length > 0 ? (
        <ReconstructionPopover word={token} lineGroup={lineGroup}>
          {children}
        </ReconstructionPopover>
      ) : (
        <>
          {children}
          <VariantAlignmentIndicator token={token} />
        </>
      )
    ) : (
      <>{children}</>
    )
  }
  return WordInfoPopover
}
