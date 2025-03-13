import React, { FunctionComponent } from 'react'
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

function VariantAlignmentIndicator({
  token,
}: {
  token: Token
}): JSX.Element | null {
  return isAnyWord(token) &&
    (token.hasVariantAlignment || token.hasOmittedAlignment) ? (
    <sup className="word-info__variant-alignment-indicator">‡</sup>
  ) : null
}

type PopoverProps = PropsWithChildren<{
  token: AnyWord
  lineGroup: LineGroup
}>

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

function WordInfoTrigger({
  overlay,
  children,
  onMouseEnter,
  onMouseLeave,
  token,
}: {
  overlay: OverlayChildren
  children: React.ReactNode
  token: Token
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
  token,
  lineGroup,
  children,
}: PopoverProps): JSX.Element {
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
    >
      {children}
    </WordInfoTrigger>
  )
}

export function ManuscriptInfoPopover({
  token,
  lineGroup,
  children,
}: PopoverProps): JSX.Element {
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
      </Popover.Content>
    </Popover>
  )

  return (
    <WordInfoTrigger overlay={popover} token={token}>
      {children}
    </WordInfoTrigger>
  )
}

function LemmaInfoPopover({
  token,
  children,
}: Omit<PopoverProps, 'lineGroup'>): JSX.Element {
  const dictionary = useDictionary()

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <PopoverTitle>{children}</PopoverTitle>
      <Popover.Content>
        <LemmaInfo word={token} dictionary={dictionary} />
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
}: TokenActionWrapperProps): JSX.Element {
  const hasLemma = isAnyWord(token) && token.uniqueLemma.length > 0

  return hasLemma ? (
    <LemmaInfoPopover token={token}>{children}</LemmaInfoPopover>
  ) : (
    <>
      {children}
      <VariantAlignmentIndicator token={token} />
    </>
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
    const hasLemma = isAnyWord(token) && token.uniqueLemma.length > 0
    return hasLemma ? (
      <Component token={token} lineGroup={lineGroup}>
        {children}
      </Component>
    ) : (
      <>
        {children}
        <VariantAlignmentIndicator token={token} />
      </>
    )
  }
  return ActionWrapper
}
