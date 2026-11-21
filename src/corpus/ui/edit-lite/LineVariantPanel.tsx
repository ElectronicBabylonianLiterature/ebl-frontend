import React, { useId } from 'react'
import { ManuscriptSummary } from 'corpus/application/edit-lite/chapterOutline'
import { LineVariant, ManuscriptLine } from 'corpus/domain/line'
import LazyAtfEditor from 'corpus/ui/edit-lite/LazyAtfEditor'
import {
  addVariantManuscriptLine,
  removeVariantManuscriptLine,
  setVariantIntertext,
  setVariantManuscriptLine,
  setVariantReconstruction,
} from 'corpus/ui/edit-lite/lineDraft'
import ManuscriptLineRow from 'corpus/ui/edit-lite/ManuscriptLineRow'
import useStableCallback from 'corpus/ui/edit-lite/useStableCallback'
import 'corpus/ui/edit-lite/edit-lite.sass'
import 'corpus/ui/edit-lite/ManuscriptLineRow.sass'

interface Props {
  readonly variantIndex: number
  readonly isCaptionVisible: boolean
  readonly variant: LineVariant
  readonly manuscripts: readonly ManuscriptSummary[]
  readonly onChange: (variantIndex: number, variant: LineVariant) => void
  readonly onDelete: (variantIndex: number) => void
  readonly disabled: boolean
  readonly readOnly: boolean
}

function LineVariantPanel({
  variantIndex,
  isCaptionVisible,
  variant,
  manuscripts,
  onChange,
  onDelete,
  disabled,
  readOnly,
}: Props): JSX.Element {
  const id = useId()
  const caption = `Variant ${variantIndex + 1}`
  const handleIntertextChange = useStableCallback((intertext: string): void =>
    onChange(variantIndex, setVariantIntertext(variant, intertext)),
  )
  const handleReconstructionChange = useStableCallback(
    (reconstruction: string): void =>
      onChange(variantIndex, setVariantReconstruction(variant, reconstruction)),
  )
  const handleManuscriptLineChange = useStableCallback(
    (manuscriptIndex: number, manuscriptLine: ManuscriptLine): void =>
      onChange(
        variantIndex,
        setVariantManuscriptLine(variant, manuscriptIndex, manuscriptLine),
      ),
  )
  const handleManuscriptLineDelete = useStableCallback(
    (manuscriptIndex: number): void =>
      onChange(
        variantIndex,
        removeVariantManuscriptLine(variant, manuscriptIndex),
      ),
  )

  return (
    <div className="edit-lite-variant" role="group" aria-label={caption}>
      {isCaptionVisible && (
        <span className="edit-lite-variant__caption" aria-hidden="true">
          {caption}
        </span>
      )}
      <div className="edit-lite-field">
        <span className="edit-lite-label" aria-hidden="true">
          Intertext
        </span>
        <LazyAtfEditor
          name={`Intertext-${id}`}
          label="Intertext"
          value={variant.intertext}
          onChange={handleIntertextChange}
          disabled={disabled}
        />
      </div>
      <div className="edit-lite-field">
        <span className="edit-lite-label" aria-hidden="true">
          Ideal reconstruction
        </span>
        <LazyAtfEditor
          name={`IdealReconstruction-${id}`}
          label="Ideal reconstruction"
          value={variant.reconstruction}
          onChange={handleReconstructionChange}
          disabled={disabled}
        />
      </div>
      {variant.manuscripts.length > 0 && (
        <div className="edit-lite-manuscripts">
          <div
            className="edit-lite-manuscript edit-lite-manuscript--header"
            aria-hidden="true"
          >
            <span>Siglum</span>
            <span>Labels</span>
            <span>Line nr.</span>
            <span className="edit-lite-manuscript__text">Text</span>
          </div>
          {variant.manuscripts.map((manuscriptLine, manuscriptIndex) => (
            <ManuscriptLineRow
              key={manuscriptIndex}
              manuscriptIndex={manuscriptIndex}
              manuscriptLine={manuscriptLine}
              manuscripts={manuscripts}
              onChange={handleManuscriptLineChange}
              onDelete={handleManuscriptLineDelete}
              disabled={disabled}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
      {!readOnly && (
        <div className="edit-lite-variant__actions">
          <button
            type="button"
            className="edit-lite-link-button"
            disabled={disabled}
            onClick={(): void =>
              onChange(variantIndex, addVariantManuscriptLine(variant))
            }
          >
            Add manuscript line
          </button>
          {isCaptionVisible && (
            <button
              type="button"
              className="edit-lite-link-button"
              aria-label={`Delete ${caption.toLowerCase()}`}
              disabled={disabled}
              onClick={(): void => onDelete(variantIndex)}
            >
              Delete variant
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(LineVariantPanel)
