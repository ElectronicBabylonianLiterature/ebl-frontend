import React from 'react'
import { Popover } from 'react-bootstrap'

export default function TransliterationHelp () {
  return (
    <Popover id='Transliteration help' title='Special characters'>
      <p>
        Use <code>Ctrl</code> or <code>Command</code> for characters with a macron, as well as for <code>š</code>, <code>ʾ</code> and subindex numbers (e.g. <code>Ctrl-a</code> results in <code>ā</code>).
      </p>
      <p>
        Use <code>Alt</code> or <code>Option</code> for characters with a circumflex and emphatic consonants (e.g. <code>Alt-a</code> results in <code>â</code>).
      </p>
      <p>
      Use <code>Shift</code> for capital letters (e.g. <code>Ctrl-Shift-a</code> results in <code>Ā</code> and <code>Alt-Shift-a</code> results in <code>Â</code>).
      </p>
    </Popover>
  )
}
