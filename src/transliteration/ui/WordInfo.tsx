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

export default function WordInfoWithPopover({
  word,
  tokenClasses = [],
  lineGroup = null,
  children,
}: PropsWithChildren<{
  word: LemmatizableToken
  tokenClasses?: readonly string[]
  lineGroup?: LineGroup | null
}>): JSX.Element {
  const dictionary = useDictionary()
  const isReconstructionWord =
    lineGroup !== null &&
    !_.isNil(word.sentenceIndex) &&
    word.alignment === null

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
            manuscriptLines={lineGroup?.manuscriptLines}
          />
          {isReconstructionWord && (
            <Alignments
              tokenIndex={word.sentenceIndex}
              lemma={word.uniqueLemma}
              lineGroup={lineGroup}
              dictionary={dictionary}
            />
          )}
        </>
      </Popover.Content>
    </Popover>
  )

  return (
    <span className="word-info__wrapper">
      {word.uniqueLemma.length > 0 ? (
        <OverlayTrigger
          trigger="click"
          rootClose
          placement="top"
          overlay={popover}
        >
          {isReconstructionWord ? (
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
          ) : (
            <span className="word-info__trigger" role="button">
              {children}
            </span>
          )}
        </OverlayTrigger>
      ) : (
        <>{children}</>
      )}
      <VariantAlignmentIndicator token={word} />
    </span>
  )
}

export function LemmaAlignmentPopover({
  token,
  children,
}: PropsWithChildren<{
  token: Token
}>): JSX.Element {
  return isAnyWord(token) ? (
    <WordInfoWithPopover word={token}>{children}</WordInfoWithPopover>
  ) : (
    <>{children}</>
  )
}

export function createWordInfoPopover(
  lineGroup: LineGroup
): FunctionComponent<TokenActionWrapperProps> {
  const WordInfoPopover = ({
    token,
    children,
  }: PropsWithChildren<{
    token: Token
  }>): JSX.Element => {
    return isAnyWord(token) ? (
      <WordInfoWithPopover word={token} lineGroup={lineGroup}>
        {children}
      </WordInfoWithPopover>
    ) : (
      <>{children}</>
    )
  }
  return WordInfoPopover
}

export function WordInfo({
  token,
  children,
}: PropsWithChildren<{
  token: Token
}>): JSX.Element {
  return isAnyWord(token) ? (
    <>
      <>{children}</>
      <VariantAlignmentIndicator token={token} />
    </>
  ) : (
    <>{children}</>
  )
}
