import React from 'react'
import { PropsWithChildren } from 'react'
import _ from 'lodash'
import { LemmatizableToken } from 'transliteration/domain/token'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { useDictionary } from 'dictionary/ui/dictionary-context'
import classNames from 'classnames'

import './WordInfo.sass'
import { LineGroup } from './LineGroup'
import { Alignments } from './WordInfoAlignments'
import LemmaInfo from './WordInfoLemmas'

function VariantAlignmentIndicator({
  word,
}: {
  word: LemmatizableToken
}): JSX.Element | null {
  return word.hasVariantAlignment || word.hasOmittedAlignment ? (
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
      <VariantAlignmentIndicator word={word} />
    </span>
  )
}

export function WordInfo({
  word,
  children,
}: PropsWithChildren<{
  word: LemmatizableToken
  tokenClasses: readonly string[]
}>): JSX.Element {
  return (
    <>
      <>{children}</>
      <VariantAlignmentIndicator word={word} />
    </>
  )
}
