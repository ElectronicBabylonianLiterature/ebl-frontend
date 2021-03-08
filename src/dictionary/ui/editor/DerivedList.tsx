import React, { ReactNode } from 'react'
import { FormGroup } from 'react-bootstrap'

import FormList from './FormList'
import List from 'common/List'

export default function DerivedList({
  value,
  onChange,
  children,
}: {
  value: any
  onChange: (value: void) => void
  children: ReactNode
}): JSX.Element {
  return (
    <FormGroup>
      <List
        label={children}
        value={value}
        onChange={onChange}
        noun="group"
        defaultValue={[]}
      >
        {(group, onChange, groupIndex) => (
          <FormList
            onChange={onChange}
            value={group}
            fields={['lemma', 'homonym', 'notes']}
          >
            {groupIndex + 1}. group
          </FormList>
        )}
      </List>
    </FormGroup>
  )
}
