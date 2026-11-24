import React, { RefObject, useCallback, useLayoutEffect, useRef } from 'react'

export interface WordKeys {
  accept(): void
  next(): void
  previous(): void
}

interface FieldFocus {
  readonly fieldsRef: RefObject<HTMLDivElement>
  readonly focusField: () => void
}

const fieldSelector = 'select, input:not([type="hidden"])'
const stopSelector = `${fieldSelector}, .dropdown-toggle`

export const alignmentKeysHint =
  'Enter sets the alignment and goes to the next word, Tab skips the word, Shift+Tab goes back, Escape closes the word and F2 moves between the ideal word and the variant.'
export const lemmatizationKeysHint =
  'Enter accepts the lemma and goes to the next word, Tab skips the word, Shift+Tab goes back, Escape closes the word and F2 moves between the lemma and the actions of the word.'

export function handleWordKeys(
  event: React.KeyboardEvent,
  keys: WordKeys,
): void {
  if (event.defaultPrevented) {
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    keys.accept()
  } else if (event.key === 'Tab') {
    event.preventDefault()
    const move = event.shiftKey ? keys.previous : keys.next
    move()
  }
}

export function hasOpenMenu(container: HTMLElement): boolean {
  return container.querySelector('.dropdown-menu.show') !== null
}

export function focusNextStop(container: HTMLElement): void {
  const stops = Array.from(
    container.querySelectorAll<HTMLElement>(stopSelector),
  )
  const current = stops.findIndex((stop) => stop === document.activeElement)
  stops[(current + 1) % stops.length]?.focus()
}

export function useFieldFocus(key: unknown): FieldFocus {
  const fieldsRef = useRef<HTMLDivElement>(null)
  const focusField = useCallback((): void => {
    fieldsRef.current
      ?.querySelector<HTMLElement>(fieldSelector)
      ?.focus({ preventScroll: true })
  }, [])

  useLayoutEffect(focusField, [focusField, key])

  return { fieldsRef, focusField }
}
