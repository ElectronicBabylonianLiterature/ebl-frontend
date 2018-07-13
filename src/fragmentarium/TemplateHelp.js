import React from 'react'
import { Popover } from 'react-bootstrap'

const obverse = `1. [...]  [...]
2. [...]  [...]
3. [...]  [...]`

const obverseAndReverse = `@obverse
1. [...]  [...]
2. [...]  [...]

@reverse
1. [...]  [...]
2. [...]  [...]
3. [...]  [...]`

const suffix = `@obverse
1'. [...]  [...]
2'. [...]  [...]

@reverse
1. [...]  [...]
2. [...]  [...]
3. [...]  [...]`

export default function HelpPopover () {
  return (
    <Popover id='Template help' title='Create a list of numbers with the suffix ". [...]  [...]"'>
      <p>
        If only the first number is given, then only one list is created:
        <code>3</code> results in:
      </p>
      <pre>{obverse}</pre>
      <p>
        If two numbers separated by a comma are given, then two lists are created,
        the first preceded by <code>@obverse</code> and the second by <code>@reverse</code>:
        <code>2, 3</code> results in:
      </p>
      <pre>{obverseAndReverse}</pre>
      <p>
        If the numbers of the field contain a suffix, then the suffix is added to each number of the list.
        Thus, <code>2', 3</code> results in:
      </p>
      <pre>{suffix}</pre>
    </Popover>
  )
}
