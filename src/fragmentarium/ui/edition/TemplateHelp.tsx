import React from 'react'
import { Popover } from 'react-bootstrap'
import _ from 'lodash'

const obverse = `1. [...]  [...]
2. [...]  [...]`

const obverseReverseAndsuffix = `@obverse
1'. [...]  [...]

@reverse
1. [...]  [...]
2. [...]  [...]`

export default function TemplateHelp(): JSX.Element {
  return (
    <Popover id={_.uniqueId('TemplateHelp-')} title="Create template">
      <Popover.Body>
        <p>
          If only the first number is given, then only one list is created:
          <code>2</code> results in:
        </p>
        <pre>{obverse}</pre>
        <p>
          If two numbers separated by a comma are given, then two lists are
          created, the first preceded by <code>@obverse</code> and the second by{' '}
          <code>@reverse</code>.
        </p>
        <p>
          If the numbers of the field contain a suffix, then the suffix is added
          to each number of the list. Thus, <code>1&apos;, 2</code> results in:
        </p>
        <pre>{obverseReverseAndsuffix}</pre>
      </Popover.Body>
    </Popover>
  )
}
