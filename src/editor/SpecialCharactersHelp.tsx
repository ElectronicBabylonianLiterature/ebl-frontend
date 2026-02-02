import React from 'react'
import { Popover } from 'react-bootstrap'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'

function SpecialCharactersHelp() {
  return (
    <Popover
      id={_.uniqueId('SpecialCharactersHelp-')}
      title="Special characters"
    >
      <Popover.Body>
        <p>
          For characters with a macron and <code>š</code> use <code>Ctrl</code>{' '}
          or <code>Command</code> (e.g. <code>Ctrl-a</code> results in{' '}
          <code>ā</code>
          ).
        </p>
        <p>
          For characters with a circumflex, emphatic consonants, subindex
          characters and <code>ḫ</code> use <code>Alt</code> or{' '}
          <code>Option</code> (e.g. <code>Alt-a</code> results in <code>â</code>
          ).
        </p>
        <p>
          For aleph use <code>Ctrl</code>-<code>Alt</code>-<code>a</code> or{' '}
          <code>Command</code>-<code>Option</code>-<code>a</code>; for ø use{' '}
          <code>Ctrl</code>-<code>o</code>.
        </p>
        <p>
          For capital letters use <code>Shift</code> (e.g. <code>Ctrl</code>-
          <code>Shift</code>-<code>a</code> results in <code>Ā</code> and{' '}
          <code>Alt</code>-<code>Shift</code>-<code>a</code> results in{' '}
          <code>Â</code>
          ).
        </p>
        <p>
          Fractions: <code>Ctrl</code>-<code>1</code> = <code>½</code>,{' '}
          <code>Ctrl</code>-<code>2</code> = <code>⅔</code>, etc.
        </p>
        <p>
          Auto-complete: Press <code>Enter</code> to select an option and use{' '}
          <code>tab</code> to switch through editable points in the snippet.
        </p>
        <p>
          Incrementing/decrementing lines: If you need to update multiple line
          numbers, select the lines in question and press <code>Ctrl</code>-
          <code>Shift</code>-<code>UP</code> or <code>Ctrl</code>-
          <code>Shift</code>-<code>DOWN</code> (Mac: <code>Option</code>-
          <code>UP</code>/<code>DOWN</code>) to add/subtract 1 to the selected
          lines. Unnumbered lines are ignored.
        </p>
      </Popover.Body>
    </Popover>
  )
}

export default function SpecialCharactersHelpTrigger(): JSX.Element {
  return <HelpTrigger overlay={SpecialCharactersHelp()} />
}
