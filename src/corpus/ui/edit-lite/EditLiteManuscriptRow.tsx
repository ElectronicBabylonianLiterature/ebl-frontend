import React, { useCallback, useId } from 'react'
import classNames from 'classnames'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { Manuscript } from 'corpus/domain/manuscript'
import { Provenance } from 'corpus/domain/provenance'
import {
  manuscriptColumns,
  summarizeManuscript,
} from 'corpus/ui/edit-lite/EditLiteManuscriptSummary'
import ManuscriptForm from 'corpus/ui/manuscripts/ManuscriptForm'
import 'corpus/ui/edit-lite/edit-lite.sass'
import 'corpus/ui/edit-lite/EditLiteManuscripts.sass'

interface Props {
  readonly index: number
  readonly manuscript: Manuscript
  readonly isEdited: boolean
  readonly isOpen: boolean
  readonly provenances: readonly Provenance[]
  readonly searchBibliography: (
    query: string,
  ) => Promise<readonly BibliographyEntry[]>
  readonly onToggle: (index: number) => void
  readonly onChange: (index: number, manuscript: Manuscript) => void
}

function EditLiteManuscriptRow({
  index,
  manuscript,
  isEdited,
  isOpen,
  provenances,
  searchBibliography,
  onToggle,
  onChange,
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
          {isEdited && (
            <span className="edit-lite-badge edit-lite-badge--edited">
              edited
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
          <ManuscriptForm
            manuscript={manuscript}
            provenanceOptions={provenances}
            onChange={handleChange}
            searchBibliography={searchBibliography}
          />
        )}
      </div>
    </li>
  )
}

export default React.memo(EditLiteManuscriptRow)
