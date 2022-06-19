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

export default function WordInfo({
  word,
  tokenClasses,
  children,
  lineGroup = null,
  isInPopover = false,
}: PropsWithChildren<{
  word: LemmatizableToken
  tokenClasses: readonly string[]
  lineGroup?: LineGroup | null
  isInPopover?: boolean
}>): JSX.Element {
  const dictionary = useDictionary()
  const isInLineGroup = lineGroup !== null
  const isReconstructionWord =
    isInLineGroup && !_.isNil(word.sentenceIndex) && word.alignment === null

  const popover = !isInPopover ? (
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
            manuscriptLines={lineGroup?.manuscriptLines || [[]]}
          />
          {isReconstructionWord && (
            <Alignments
              tokenIndex={word.sentenceIndex}
              lineGroup={lineGroup}
              dictionary={dictionary}
            />
          )}
        </>
      </Popover.Content>
    </Popover>
  ) : null

  const trigger = isReconstructionWord ? (
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
  )

  return (
    <>
      {word.uniqueLemma.length > 0 && !_.isNull(popover) ? (
        <OverlayTrigger
          trigger="click"
          rootClose
          placement="top"
          overlay={popover}
        >
          {trigger}
        </OverlayTrigger>
      ) : (
        <>{children}</>
      )}
      {word.hasVariantAlignment && (
        <sup className="word-info__variant-alignment-indicator">‡</sup>
      )}
    </>
  )
}
