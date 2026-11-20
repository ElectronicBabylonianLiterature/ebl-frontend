import React, { useEffect, useRef, useState } from 'react'
import { produce } from 'immer'
import { removeAt } from 'corpus/ui/edit-lite/manuscriptEdits'
import 'corpus/ui/edit-lite/edit-lite.sass'
import 'corpus/ui/edit-lite/EditLiteManuscripts.sass'
import 'corpus/ui/edit-lite/ManuscriptLineRow.sass'

interface Props {
  readonly fragments: readonly string[]
  readonly onChange: (fragments: readonly string[]) => void
  readonly readOnly: boolean
  readonly disabled: boolean
}

interface FragmentProps {
  readonly fragment: string
  readonly isActive: boolean
  readonly disabled: boolean
  readonly onActivate: () => void
  readonly onDeactivate: () => void
  readonly onChange: (fragment: string) => void
  readonly onDelete: () => void
}

export const emptyFragment = '(empty)'

function EditableFragment({
  fragment,
  isActive,
  disabled,
  onActivate,
  onDeactivate,
  onChange,
  onDelete,
}: FragmentProps): JSX.Element {
  const caption = fragment || emptyFragment
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus()
    }
  }, [isActive])

  return (
    <>
      {isActive ? (
        <input
          className="edit-lite-input"
          type="text"
          ref={inputRef}
          aria-label="Museum Number"
          value={fragment}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
            onChange(event.target.value)
          }
          onBlur={onDeactivate}
        />
      ) : (
        <button
          type="button"
          className="edit-lite-siglum edit-lite-siglum--static"
          aria-label={`Edit uncertain fragment ${caption}`}
          disabled={disabled}
          onClick={onActivate}
        >
          {caption}
        </button>
      )}
      <button
        type="button"
        className="edit-lite-link-button"
        aria-label={`Delete uncertain fragment ${caption}`}
        disabled={disabled}
        onClick={onDelete}
      >
        Delete
      </button>
    </>
  )
}

export default function EditLiteUncertainFragments({
  fragments,
  onChange,
  readOnly,
  disabled,
}: Props): JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const changeFragment = (index: number, fragment: string): void =>
    onChange(
      produce(fragments, (draft) => {
        draft[index] = fragment
      }),
    )
  const deleteFragment = (index: number): void => {
    setActiveIndex(null)
    onChange(removeAt(fragments, index))
  }
  const addFragment = (): void => {
    setActiveIndex(fragments.length)
    onChange([...fragments, ''])
  }

  return (
    <section
      className="edit-lite-uncertain-fragments"
      aria-label="Uncertain fragments"
    >
      <h4 className="edit-lite-uncertain-fragments__heading">
        Uncertain fragments
      </h4>
      {fragments.length === 0 ? (
        <p className="edit-lite-manuscript-list__empty">
          This chapter has no uncertain fragments.
        </p>
      ) : (
        <div className="edit-lite-uncertain-fragments__list">
          {fragments.map((fragment, index) => (
            <div key={index} className="edit-lite-uncertain-fragments__item">
              {readOnly ? (
                fragment
              ) : (
                <EditableFragment
                  fragment={fragment}
                  isActive={index === activeIndex}
                  disabled={disabled}
                  onActivate={(): void => setActiveIndex(index)}
                  onDeactivate={(): void => setActiveIndex(null)}
                  onChange={(changed: string): void =>
                    changeFragment(index, changed)
                  }
                  onDelete={(): void => deleteFragment(index)}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {!readOnly && (
        <button
          type="button"
          className="edit-lite-link-button"
          disabled={disabled}
          onClick={addFragment}
        >
          Add fragment
        </button>
      )}
    </section>
  )
}
