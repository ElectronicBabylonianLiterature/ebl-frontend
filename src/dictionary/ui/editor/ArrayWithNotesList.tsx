import React from 'react'
import { FormGroup } from 'react-bootstrap'

import ArrayWithNotes from './ArrayWithNotes'
import List from 'common/List'

export default function ArrayWithNotesList({
  value,
  onChange,
  noun,
  property,
  separator,
  children,
}: {
  value
  onChange
  noun
  property
  separator
  children?: React.ReactNode
}): JSX.Element {
  return (
    <FormGroup>
      <List
        label={children}
        value={value}
        onChange={onChange}
        noun={noun}
        defaultValue={{ [property]: [], notes: [] }}
      >
        {(item, onChange) => (
          <ArrayWithNotes
            onChange={onChange}
            noun={noun}
            property={property}
            separator={separator}
            value={item}
          />
        )}
      </List>
    </FormGroup>
  )
}
