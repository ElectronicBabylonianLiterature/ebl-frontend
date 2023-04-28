import React from 'react'
import _ from 'lodash'
import { Popover } from 'react-bootstrap'

export function ReferenceSearchHelp(): JSX.Element {
  return (
    <Popover id={_.uniqueId('ReferenceSearchHelp-')} title="Search References">
      <Popover.Content>
        Search for Author and Year <br />
        (e.g. <code>George 20</code> or <code>George 2003</code>) or
        Abbreviation (and Number) <br />
        (e.g. <code>BWL</code> or <code>CT 13</code>)
      </Popover.Content>
    </Popover>
  )
}

export function LemmaSearchHelp(): JSX.Element {
  return (
    <Popover id={_.uniqueId('ReferenceSearchHelp-')} title="Search References">
      <Popover.Content>
        Search for fragments containing
        <ul>
          <li>
            All of the lemmata in the same line: <code>Same line</code>
          </li>
          <li>
            All of the lemmata in the same line and in the specified order:{' '}
            <code>Exact phrase</code>
          </li>
          <li>
            All of the lemmata: <code>Same text</code>
          </li>
          <li>
            Any of the lemmata: <code>Anywhere</code>
          </li>
        </ul>
      </Popover.Content>
    </Popover>
  )
}

export function TransliterationSearchHelp(): JSX.Element {
  return (
    <Popover
      id={_.uniqueId('TransliterationSearchHelp-')}
      title="Search transliterations"
    >
      <Popover.Content>
        <ul>
          <li>
            Sequences of signs are retrieved regardless of the values entered:
            e.g., <code>me lik</code> will retrieve <code>šip taš</code>,{' '}
            <code>me ur</code>, etc.
          </li>
          <li>
            Signs in consecutive lines can be searched by entering them in
            consecutive lines of the search field.
          </li>
          <li>
            Text with diacritics (e.g. <code>ša₂</code>, <code>á</code>) or
            without them (e.g. <code>sza2</code> or <code>ca2</code>,{' '}
            <code>s,a3</code>, <code>t,a4</code>) can be entered.
          </li>
          <li>
            Accepted Wildcards: <code>?</code> (any one sign); <code>*</code>{' '}
            (any sign or sequence of signs in a line); <code>[a|b]</code>{' '}
            (alternative signs, e.g. <code>[bu|ba]</code>).
          </li>
        </ul>
      </Popover.Content>
    </Popover>
  )
}

export function ScriptSearchHelp(): JSX.Element {
  return (
    <Popover id={_.uniqueId('ScriptSearchHelp-')} title="Search Period">
      <Popover.Content>
        Filter by script (only takes effect on fragment search)
      </Popover.Content>
    </Popover>
  )
}
