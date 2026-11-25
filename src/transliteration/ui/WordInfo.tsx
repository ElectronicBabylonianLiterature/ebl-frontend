import React from 'react'
import { PropsWithChildren } from 'react'
import { AnyWord, Token } from 'transliteration/domain/token'
import { Overlay, Popover } from 'react-bootstrap'
import { useDictionary } from 'dictionary/ui/dictionary-context'

import 'transliteration/ui/WordInfo.sass'
import { LineGroup } from 'transliteration/ui/LineGroup'
import LemmaInfo from 'transliteration/ui/WordInfoLemmas'
import { isAnyWord } from 'transliteration/domain/type-guards'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'
import {
  LineLemmasContext,
  useLineLemmasContext,
} from 'transliteration/ui/LineLemmasContext'
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
  id,
  onClose,
}: {
  children?: React.ReactNode | undefined
  id?: string
  onClose?: () => void
}): JSX.Element {
  return (
    <Popover.Header className={onClose && 'word-info__popover-header'}>
      <span id={id} className={'word-info__header'}>
        {children}
      </span>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close word information"
          onClick={onClose}
        />
      )}
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
  const [show, setShow] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const popoverId = `word-info-${React.useId()}`
  const titleId = `${popoverId}-title`

  const close = React.useCallback((): void => {
    setShow(false)
    triggerRef.current?.focus()
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
    if (show && event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
    }
  }

  const popover = (
    <Popover
      id={popoverId}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="word-info__popover"
      onKeyDown={handleKeyDown}
    >
      <PopoverTitle id={titleId} onClose={close}>
        {children}
      </PopoverTitle>
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
      <button
        type="button"
        ref={triggerRef}
        className="word-info__trigger"
        aria-haspopup="dialog"
        aria-expanded={show}
        aria-controls={show ? popoverId : undefined}
        onClick={(): void => setShow(!show)}
        onKeyDown={handleKeyDown}
      >
        <VariantAlignmentIndicator token={token}>
          {children}
        </VariantAlignmentIndicator>
      </button>
      <Overlay
        show={show}
        target={triggerRef.current}
        rootClose
        placement="top"
        onHide={(): void => setShow(false)}
        onEntered={(node: HTMLElement): void => node.focus()}
      >
        {popover}
      </Overlay>
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
