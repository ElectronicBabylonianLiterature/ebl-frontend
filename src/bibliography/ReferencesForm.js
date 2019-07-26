// @flow
import React from 'react'
import ListForm from '../common/List'
import ReferenceForm from './ReferenceForm'
import Reference from './Reference'
import BibliographyEntry from './BibliographyEntry'

export const defaultReference = () => new Reference()

export default function ReferencesForm({
  searchBibliography,
  value,
  onChange,
  label,
  collapsed
}: {
  searchBibliography: string => $ReadOnlyArray<BibliographyEntry>,
  value: $ReadOnlyArray<Reference>,
  onChange: ($ReadOnlyArray<Reference>) => void,
  label: string,
  collapsed: boolean
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
