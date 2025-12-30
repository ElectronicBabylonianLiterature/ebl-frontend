import React from 'react'
import { Popover } from 'react-bootstrap'
import _ from 'lodash'
import HelpTrigger from 'common/HelpTrigger'

export function HelpEntry(definition: JSX.Element | string): JSX.Element {
  const SearchHelp = (
    <Popover id={_.uniqueId('WordSearchHelp-')} title="Search dictionary">
      <Popover.Content>{definition}</Popover.Content>
    </Popover>
  )
  return <HelpTrigger overlay={SearchHelp} />
}

export const basicDiacriticsHelp = (
  <>
    To enter diacritics, use:
    <ul>
      <li>
        <code>sz</code> → <code>š</code>
      </li>
      <li>
        <code>s,</code> → <code>ṣ</code>
      </li>
      <li>
        <code>t,</code> → <code>ṭ</code>
      </li>
      <li>
        <code>aa</code> → <code>ā</code>
      </li>
      <li>
        <code>aaa</code> → <code>â</code>
      </li>
      etc.
    </ul>
  </>
)

export const wildCardsHelp = (
  <>
    Wildcards:
    <ul>
      <li>
        <code>?</code> for any one character.
      </li>
      <li>
        <code>*</code> for any sequence of characters.
      </li>
    </ul>
  </>
)

export const exactSearchHelp = (
  <>
    Unicode diacritics and capital letters are collated in non-precise search{' '}
    (e.g. <code>s</code>, <code>S</code>, <code>š</code>, <code>Š</code>,{' '}
    <code>ṣ</code>, and <code>Ṣ</code> are interchangeable).
    <br />
    For precise search, warp your query in quotation marks (
    <code>&quot;&quot;</code>).{' '}
  </>
)
