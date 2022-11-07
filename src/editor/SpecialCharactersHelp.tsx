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
      <Popover.Content>
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
          For aleph use <code>Ctrl-Alt-a</code> or <code>Command-Option-a</code>
          .
        </p>
        <p>
          For capital letters use <code>Shift</code> (e.g.{' '}
          <code>Ctrl-Shift-a</code> results in <code>Ā</code> and{' '}
          <code>Alt-Shift-a</code> results in <code>Â</code>).
        </p>
        <p>
          Fractions: <code>Ctrl-1</code> = <code>½</code>, <code>Ctrl-2</code> ={' '}
          <code>⅔</code>, etc.
        </p>
      </Popover.Content>
    </Popover>
  )
}

export default function SpecialCharactersHelpTrigger(): JSX.Element {
  return <HelpTrigger overlay={SpecialCharactersHelp()} />
}
