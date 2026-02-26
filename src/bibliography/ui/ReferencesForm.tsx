import React from 'react'
import Promise from 'bluebird'
import ListForm from 'common/List'
import ReferenceForm from './ReferenceForm'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

export const defaultReference = (): Reference => new Reference()

export default function ReferencesForm({
  searchBibliography,
  value,
  onChange,
  label = '',
  collapsed = false,
}: {
  searchBibliography: (
    query: string,
  ) => Promise<ReadonlyArray<BibliographyEntry>>
  value: ReadonlyArray<Reference>
  onChange: (value: ReadonlyArray<Reference>) => void
  label?: string
  collapsed?: boolean
}): JSX.Element {
  return (
    <ListForm
      value={value}
      onChange={onChange}
      label={label}
      noun="Reference"
      defaultValue={defaultReference}
      collapsed={collapsed}
    >
      {(reference, onChange) => (
        <ReferenceForm
          searchBibliography={searchBibliography}
          onChange={onChange}
          value={reference}
        />
      )}
    </ListForm>
  )
}
