import React from 'react'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { Manuscript } from 'corpus/domain/manuscript'
import { Provenance } from 'corpus/domain/provenance'
import EditLiteManuscriptRow from 'corpus/ui/edit-lite/EditLiteManuscriptRow'
import { manuscriptColumns } from 'corpus/ui/edit-lite/EditLiteManuscriptSummary'
import { ManuscriptStatus } from 'corpus/ui/edit-lite/manuscriptEdits'
import 'corpus/ui/edit-lite/EditLiteManuscripts.sass'

interface Props {
  readonly manuscripts: readonly Manuscript[]
  readonly statuses: readonly ManuscriptStatus[]
  readonly openIndices: readonly number[]
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

export default function EditLiteManuscriptList({
  manuscripts,
  statuses,
  openIndices,
  ...rowProps
}: Props): JSX.Element {
  return manuscripts.length === 0 ? (
    <p className="edit-lite-manuscript-list__empty">
      This chapter has no manuscripts.
    </p>
  ) : (
    <>
      <div className="edit-lite-manuscript-list__captions" aria-hidden="true">
        <span />
        {manuscriptColumns.map((column) => (
          <span key={column.key} className="edit-lite-manuscript-list__caption">
            {column.caption}
          </span>
        ))}
      </div>
      <ol className="edit-lite-manuscript-list__rows" aria-label="Manuscripts">
        {manuscripts.map((manuscript, index) => (
          <EditLiteManuscriptRow
            key={index}
            index={index}
            manuscript={manuscript}
            status={statuses[index]}
            isOpen={openIndices.includes(index)}
            {...rowProps}
          />
        ))}
      </ol>
    </>
  )
}
