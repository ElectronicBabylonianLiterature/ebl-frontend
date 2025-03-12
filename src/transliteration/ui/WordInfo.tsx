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
import { OverlayChildren } from 'react-bootstrap/esm/Overlay'

function VariantAlignmentIndicator({
  token,
}: {
  token: LemmatizableToken
}): JSX.Element | null {
  return token.hasVariantAlignment || token.hasOmittedAlignment ? (
    <sup className="word-info__variant-alignment-indicator">‡</sup>
  ) : null
}

type PopoverProps = PropsWithChildren<{
  word: LemmatizableToken
  tokenClasses?: readonly string[]
  lineGroup: LineGroup
}>

function WordInfoTrigger({
  overlay,
  children,
  onMouseEnter,
  onMouseLeave,
  token,
}: {
  overlay: OverlayChildren
  children: React.ReactNode
  token: LemmatizableToken
} & Pick<
  React.HTMLProps<HTMLSpanElement>,
  'onMouseEnter' | 'onMouseLeave'
>): JSX.Element {
  return (
    <span className="word-info__wrapper">
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
          {children}
          <VariantAlignmentIndicator token={token} />
        </span>
      </OverlayTrigger>
    </span>
  )
}

export function ReconstructionPopover({
  word,
  tokenClasses = [],
  lineGroup,
  children,
}: PopoverProps): JSX.Element {
  const dictionary = useDictionary()

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <Popover.Title>
        <span className={classNames(['word-info__header', ...tokenClasses])}>
          {children}
        </span>
      </Popover.Title>
      <Popover.Content>
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
      </Popover.Content>
    </Popover>
  )

  return (
    <WordInfoTrigger
      overlay={popover}
      token={word}
      onMouseEnter={() =>
        lineGroup.setActiveTokenIndex(word.sentenceIndex || 0)
      }
      onMouseLeave={() => lineGroup.setActiveTokenIndex(0)}
    >
      {children}
    </WordInfoTrigger>
  )
}

export function ManuscriptInfoPopover({
  word,
  tokenClasses = [],
  lineGroup,
  children,
}: PopoverProps): JSX.Element {
  const dictionary = useDictionary()

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <Popover.Title>
        <span className={classNames(['word-info__header', ...tokenClasses])}>
          {children}
        </span>
      </Popover.Title>
      <Popover.Content>
        <LemmaInfo
          word={word}
          dictionary={dictionary}
          manuscriptLines={lineGroup.manuscriptLines}
        />
      </Popover.Content>
    </Popover>
  )

  return (
    <WordInfoTrigger overlay={popover} token={word}>
      {children}
    </WordInfoTrigger>
  )
}

function LemmaInfoPopover({
  word,
  tokenClasses = [],
  children,
}: Omit<PopoverProps, 'lineGroup'>): JSX.Element {
  const dictionary = useDictionary()

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <Popover.Title>
        <span className={classNames(['word-info__header', ...tokenClasses])}>
          {children}
        </span>
      </Popover.Title>
      <Popover.Content>
        <LemmaInfo word={word} dictionary={dictionary} />
      </Popover.Content>
    </Popover>
  )

  return (
    <WordInfoTrigger overlay={popover} token={word}>
      {children}
    </WordInfoTrigger>
  )
}

function PopoverComponent({
  Component,
  children,
  word,
  ...props
}: PopoverProps & {
  Component: FunctionComponent<PopoverProps>
}): JSX.Element {
  return word.uniqueLemma.length > 0 ? (
    <Component word={word} {...props}>
      {children}
    </Component>
  ) : (
    <>
      {children}
      <VariantAlignmentIndicator token={word} />
    </>
  )
}

export function LemmaPopover({
  token,
  children,
}: TokenActionWrapperProps): JSX.Element {
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

export function createTokenPopover(
  lineGroup: LineGroup,
  Component: FunctionComponent<PopoverProps>
): FunctionComponent<TokenActionWrapperProps> {
  const ActionWrapper = ({
    token,
    children,
  }: PropsWithChildren<{
    token: Token
  }>): JSX.Element => {
    return isAnyWord(token) ? (
      <PopoverComponent
        Component={Component}
        word={token}
        lineGroup={lineGroup}
      >
        {children}
      </PopoverComponent>
    ) : (
      <>{children}</>
    )
  }
  return ActionWrapper
}
