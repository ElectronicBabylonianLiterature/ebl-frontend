import React, { useCallback, useId } from 'react'
import classNames from 'classnames'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { Manuscript } from 'corpus/domain/manuscript'
import { Provenance } from 'corpus/domain/provenance'
import {
  manuscriptColumns,
  summarizeManuscript,
} from 'corpus/ui/edit-lite/EditLiteManuscriptSummary'
import { ManuscriptStatus } from 'corpus/ui/edit-lite/manuscriptEdits'
import ManuscriptForm from 'corpus/ui/manuscripts/ManuscriptForm'
import 'corpus/ui/edit-lite/edit-lite.sass'
import 'corpus/ui/edit-lite/EditLiteManuscripts.sass'
import 'corpus/ui/edit-lite/ManuscriptLineRow.sass'

interface Props {
  readonly index: number
  readonly manuscript: Manuscript
  readonly status: ManuscriptStatus
  readonly isOpen: boolean
  readonly provenances: readonly Provenance[]
  readonly searchBibliography: (
    query: string,
  ) => Promise<readonly BibliographyEntry[]>
  readonly onToggle: (index: number) => void
  readonly onChange: (index: number, manuscript: Manuscript) => void
  readonly onDelete: (index: number) => void
  readonly readOnly: boolean
  readonly disabled: boolean
}

function EditLiteManuscriptRow({
  index,
  manuscript,
  status,
  isOpen,
  provenances,
  searchBibliography,
  onToggle,
  onChange,
  onDelete,
  readOnly,
  disabled,
}: Props): JSX.Element {
  const panelId = useId()
  const summary = summarizeManuscript(manuscript)
  const handleChange = useCallback(
    (changedManuscript: Manuscript): void => onChange(index, changedManuscript),
    [onChange, index],
  )

  return (
    <li
      className={classNames('edit-lite-manuscript-list__row', {
        'edit-lite-manuscript-list__row--open': isOpen,
      })}
    >
      <button
        type="button"
        className="edit-lite-manuscript-list__header"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={(): void => onToggle(index)}
      >
        <span
          className="edit-lite-manuscript-list__chevron"
          aria-hidden="true"
        />
        {manuscriptColumns.map((column) => (
          <span
            key={column.key}
            className={`edit-lite-manuscript-list__cell edit-lite-manuscript-list__cell--${column.modifier}`}
          >
            {summary[column.key]}
          </span>
        ))}
        <span className="edit-lite-manuscript-list__status">
          {status !== 'unchanged' && (
            <span className="edit-lite-badge edit-lite-badge--edited">
              {status}
            </span>
          )}
        </span>
      </button>
      <div
        id={panelId}
        className="edit-lite-manuscript-list__panel"
        role="group"
        aria-label={`Editor for manuscript ${summary.siglum}`}
        hidden={!isOpen}
      >
        {isOpen && (
          <fieldset disabled={readOnly || disabled}>
            <ManuscriptForm
              manuscript={manuscript}
              provenanceOptions={provenances}
              onChange={handleChange}
              searchBibliography={searchBibliography}
            />
            {!readOnly && (
              <button
                type="button"
                className="edit-lite-link-button"
                onClick={(): void => onDelete(index)}
              >
                Delete manuscript
              </button>
            )}
          </fieldset>
        )}
      </div>
    </li>
  )
}

export default React.memo(EditLiteManuscriptRow)
