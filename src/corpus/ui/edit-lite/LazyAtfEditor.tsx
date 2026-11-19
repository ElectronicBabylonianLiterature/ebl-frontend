import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import Editor from 'editor/Editor'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly name: string
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly disabled?: boolean
}

function isActivationKey(event: React.KeyboardEvent<HTMLElement>): boolean {
  const hasModifier = event.ctrlKey || event.metaKey || event.altKey
  return !hasModifier && (event.key === 'Enter' || event.key.length === 1)
}

function LazyAtfEditor({
  name,
  label,
  value,
  onChange,
  disabled = false,
}: Props): JSX.Element {
  const [isActive, setIsActive] = useState<boolean>(false)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const staticElementRef = useRef<HTMLPreElement>(null)
  const isReturningFocusRef = useRef<boolean>(false)
  const pendingBlurCheckRef = useRef<number | undefined>(undefined)

  if (isActive && disabled) {
    setIsActive(false)
  }

  useEffect(() => {
    if (isActive) {
      editorContainerRef.current?.querySelector('textarea')?.focus()
    } else if (isReturningFocusRef.current) {
      staticElementRef.current?.focus()
      isReturningFocusRef.current = false
    }
  }, [isActive])

  useEffect(
    () => (): void => window.clearTimeout(pendingBlurCheckRef.current),
    [isActive],
  )

  const activate = (): void => {
    if (!disabled && !isReturningFocusRef.current) {
      setIsActive(true)
    }
  }

  const handleStaticKeyDown = (
    event: React.KeyboardEvent<HTMLPreElement>,
  ): void => {
    if (isActivationKey(event)) {
      event.preventDefault()
      activate()
    }
  }

  const handleEditorKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ): void => {
    if (event.key === 'Escape') {
      isReturningFocusRef.current = true
      setIsActive(false)
    }
  }

  const closeUnlessFocused = (
    container: HTMLElement,
    focusedElement: Element | null,
  ): void => {
    if (!container.contains(focusedElement)) {
      setIsActive(false)
    }
  }

  const handleEditorBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
    const container = event.currentTarget
    if (event.relatedTarget instanceof Element) {
      closeUnlessFocused(container, event.relatedTarget)
    } else {
      window.clearTimeout(pendingBlurCheckRef.current)
      pendingBlurCheckRef.current = window.setTimeout(
        (): void => closeUnlessFocused(container, document.activeElement),
        0,
      )
    }
  }

  return isActive ? (
    <div
      ref={editorContainerRef}
      className="edit-lite-atf edit-lite-atf--active"
      role="group"
      aria-label={label}
      onBlur={handleEditorBlur}
      onKeyDown={handleEditorKeyDown}
    >
      <Editor name={name} value={value} onChange={onChange} />
    </div>
  ) : (
    <pre
      ref={staticElementRef}
      className={classNames('edit-lite-atf', 'edit-lite-atf--static', {
        'edit-lite-atf--disabled': disabled,
      })}
      role="textbox"
      tabIndex={0}
      aria-label={label}
      aria-multiline="true"
      aria-disabled={disabled}
      dir="auto"
      onClick={activate}
      onFocus={activate}
      onKeyDown={handleStaticKeyDown}
    >
      {value}
    </pre>
  )
}

export default React.memo(LazyAtfEditor)
