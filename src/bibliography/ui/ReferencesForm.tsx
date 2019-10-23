import React from 'react'
import ListForm from 'common/List'
import ReferenceForm from './ReferenceForm'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

export const defaultReference = () => new Reference()

export default function ReferencesForm({
  searchBibliography,
  value,
  onChange,
  label,
  collapsed
}: {
  searchBibliography: (query: string) => ReadonlyArray<BibliographyEntry>;
  value: ReadonlyArray<Reference>;
  onChange: (value: ReadonlyArray<Reference>) => void;
  label: string;
  collapsed: boolean;
}) {
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
ReferencesForm.defaultProps = {
  label: '',
  collapsed: false
}
