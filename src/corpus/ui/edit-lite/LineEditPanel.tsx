import React, { useId } from 'react'
import { Line, LineVariant } from 'corpus/domain/line'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import LazyAtfEditor from 'corpus/ui/edit-lite/LazyAtfEditor'
import {
  addLineVariant,
  removeLineVariant,
  setBeginningOfSection,
  setLineNumber,
  setLineTranslation,
  setLineVariant,
  setSecondLineOfParallelism,
} from 'corpus/ui/edit-lite/lineDraft'
import LineVariantPanel from 'corpus/ui/edit-lite/LineVariantPanel'
import useStableCallback from 'corpus/ui/edit-lite/useStableCallback'
import 'corpus/ui/edit-lite/edit-lite.sass'
import 'corpus/ui/edit-lite/ManuscriptLineRow.sass'

interface Props {
  readonly line: Line
  readonly onChange: (line: Line) => void
  readonly disabled?: boolean
}

function LineEditPanel({
  line,
  onChange,
  disabled = false,
}: Props): JSX.Element {
  const id = useId()
  const { manuscripts, canWrite } = useEditLiteContext()
  const isLocked = disabled || !canWrite
  const handleTranslationChange = useStableCallback(
    (translation: string): void =>
      onChange(setLineTranslation(line, translation)),
  )
  const handleVariantChange = useStableCallback(
    (variantIndex: number, variant: LineVariant): void =>
      onChange(setLineVariant(line, variantIndex, variant)),
  )
  const handleVariantDelete = useStableCallback((variantIndex: number): void =>
    onChange(removeLineVariant(line, variantIndex)),
  )

  return (
    <div className="edit-lite-panel">
      <div className="edit-lite-panel__header">
        <label className="edit-lite-label" htmlFor={`${id}-number`}>
          Number
        </label>
        <input
          id={`${id}-number`}
          className="edit-lite-input edit-lite-panel__number"
          type="text"
          value={line.number}
          disabled={isLocked}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
            onChange(setLineNumber(line, event.target.value))
          }
        />
        <label className="edit-lite-check">
          <input
            type="checkbox"
            checked={line.isSecondLineOfParallelism}
            disabled={isLocked}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
              onChange(setSecondLineOfParallelism(line, event.target.checked))
            }
          />
          second line of parallelism
        </label>
        <label className="edit-lite-check">
          <input
            type="checkbox"
            checked={line.isBeginningOfSection}
            disabled={isLocked}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
              onChange(setBeginningOfSection(line, event.target.checked))
            }
          />
          beginning of a section
        </label>
      </div>
      <div className="edit-lite-field">
        <span className="edit-lite-label" aria-hidden="true">
          Translation
        </span>
        <LazyAtfEditor
          name={`Translation-${id}`}
          label="Translation"
          value={line.translation}
          onChange={handleTranslationChange}
          disabled={isLocked}
        />
      </div>
      {line.variants.map((variant, variantIndex) => (
        <LineVariantPanel
          key={variantIndex}
          variantIndex={variantIndex}
          isCaptionVisible={line.variants.length > 1}
          variant={variant}
          manuscripts={manuscripts}
          onChange={handleVariantChange}
          onDelete={handleVariantDelete}
          disabled={isLocked}
          readOnly={!canWrite}
        />
      ))}
      {canWrite && (
        <div className="edit-lite-panel__actions">
          <button
            type="button"
            className="edit-lite-link-button"
            disabled={disabled}
            onClick={(): void => onChange(addLineVariant(line))}
          >
            Add variant
          </button>
        </div>
      )}
    </div>
  )
}

export default React.memo(LineEditPanel)
