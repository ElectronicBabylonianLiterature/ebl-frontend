import React, { ReactNode } from 'react'
import { FormGroup } from 'react-bootstrap'

import FormList from './FormList'
import List from 'common/List'
import { Derived } from 'dictionary/domain/Word'

export default function DerivedList({
  value,
  onChange,
  children,
}: {
  value: readonly Derived[][]
  onChange: (value: readonly Derived[][]) => void
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
