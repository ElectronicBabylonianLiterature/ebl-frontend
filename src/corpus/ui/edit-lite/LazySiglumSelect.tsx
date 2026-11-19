import React, { useEffect, useRef, useState } from 'react'
import { ManuscriptSummary } from 'corpus/application/edit-lite/chapterOutline'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly value: number
  readonly manuscripts: readonly ManuscriptSummary[]
  readonly onChange: (manuscriptId: number) => void
  readonly disabled?: boolean
}

export const unknownSiglum = '<unknown>'

function findSiglum(
  manuscripts: readonly ManuscriptSummary[],
  manuscriptId: number,
): string | null {
  return (
    manuscripts.find((manuscript) => manuscript.id === manuscriptId)?.siglum ??
    null
  )
}

function LazySiglumSelect({
  value,
  manuscripts,
  onChange,
  disabled = false,
}: Props): JSX.Element {
  const [isActive, setIsActive] = useState<boolean>(false)
  const selectRef = useRef<HTMLSelectElement>(null)
  const siglum = findSiglum(manuscripts, value)

  if (isActive && disabled) {
    setIsActive(false)
  }

  useEffect(() => {
    if (isActive) {
      selectRef.current?.focus()
    }
  }, [isActive])

  const activate = (): void => setIsActive(true)

  return isActive ? (
    <select
      ref={selectRef}
      className="edit-lite-siglum edit-lite-siglum--active"
      aria-label="Siglum"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLSelectElement>): void =>
        onChange(Number(event.target.value))
      }
      onBlur={(): void => setIsActive(false)}
    >
      {siglum === null && (
        <option value={value} disabled>
          {unknownSiglum}
        </option>
      )}
      {manuscripts.map((manuscript) => (
        <option key={manuscript.id} value={manuscript.id}>
          {manuscript.siglum}
        </option>
      ))}
    </select>
  ) : (
    <button
      type="button"
      className="edit-lite-siglum edit-lite-siglum--static"
      aria-label={`Siglum ${siglum ?? unknownSiglum}`}
      disabled={disabled}
      onClick={activate}
      onFocus={activate}
    >
      {siglum ?? unknownSiglum}
    </button>
  )
}

export default React.memo(LazySiglumSelect)
