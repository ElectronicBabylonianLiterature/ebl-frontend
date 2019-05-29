import React from 'react'
import ListForm from 'common/List'
import ReferenceForm from './ReferenceForm'
import Reference from 'bibliography/Reference'

export const defaultReference = new Reference()

export default function ReferencesForm ({
  searchBibliography,
  value,
  onChange,
  label,
  collapsed
}) {
  return (
    <ListForm
      value={value}
      onChange={onChange}
      label={label}
      noun='Reference'
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
