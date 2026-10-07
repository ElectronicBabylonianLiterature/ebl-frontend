import React from 'react'
import { render } from '@testing-library/react'
import { Ace, edit, Range } from 'ace-builds'
import Editor from 'editor/Editor'
import AtfMode from 'editor/AtfMode'
import atSnippets from 'editor/atSnippets.json'
import hashSnippets from 'editor/hashSnippets.json'
import specialCharacters from 'editor/SpecialCharacters.json'

const name = 'transliteration'

function mountEditor(
  value: string,
  error: Record<string, unknown> | null = null,
): Ace.Editor {
  render(
    <Editor name={name} value={value} onChange={jest.fn()} error={error} />,
  )
  return edit(name)
}

function runAt(
  editor: Ace.Editor,
  command: string,
  range: [number, number, number, number],
): void {
  editor.selection.setRange(new Range(...range))
  editor.execCommand(command)
}

describe('session setup', () => {
  test('uses the ATF mode and unix line endings', () => {
    const editor = mountEditor('1. a')
    expect(editor.getSession().getMode()).toBeInstanceOf(AtfMode)
    expect(editor.getSession().getNewLineMode()).toEqual('unix')
  })

  test('annotates errors that have a line number', () => {
    const editor = mountEditor('1. a\n2. b', {
      data: {
        errors: [
          { lineNumber: 2, description: 'Invalid line' },
          { description: 'No line number' },
        ],
      },
    })
    expect(editor.getSession().getAnnotations()).toEqual([
      { row: 1, column: 0, type: 'error', text: 'Invalid line' },
    ])
    expect(editor.renderer.getShowGutter()).toBe(true)
  })

  test('hides the gutter without annotations', () => {
    const editor = mountEditor('1. a')
    expect(editor.getSession().getAnnotations()).toEqual([])
    expect(editor.renderer.getShowGutter()).toBe(false)
  })
})

describe('line number command', () => {
  test.each([
    ['1. a', '1. a\n2. '],
    ["1'. a", "1'. a\n2'. "],
    ['1a. a', '1a. a\n2. '],
    ['a line', 'a line\n'],
  ])('on the last line %p produces %p', (value, expected) => {
    const editor = mountEditor(value)
    runAt(editor, 'line number', [0, value.length, 0, value.length])
    expect(editor.getValue()).toEqual(expected)
  })

  test('inserts a plain line break when a next line exists', () => {
    const editor = mountEditor('1. a\n2. b')
    runAt(editor, 'line number', [0, 4, 0, 4])
    expect(editor.getValue()).toEqual('1. a\n\n2. b')
  })
})

describe('increment and decrement line numbers', () => {
  test.each([
    ['increment line numbers by 1', '2. a\n3. b\nc'],
    ['decrement line numbers by 1', '0. a\n1. b\nc'],
  ])('%s renumbers the selected lines', (command, expected) => {
    const editor = mountEditor('1. a\n2. b\nc')
    runAt(editor, command, [0, 0, 1, 2])
    expect(editor.getValue()).toEqual(expected)
    expect(editor.selection.getRange()).toEqual(new Range(0, 0, 1, 4))
  })

  test.each([
    ['an empty selection', [0, 0, 0, 0]],
    ['a selection not starting a line', [0, 1, 1, 2]],
  ])('ignores %s', (_label, range) => {
    const editor = mountEditor('1. a\n2. b')
    runAt(editor, 'increment line numbers by 1', [
      range[0],
      range[1],
      range[2],
      range[3],
    ])
    expect(editor.getValue()).toEqual('1. a\n2. b')
  })
})

test('inserts special characters', () => {
  const [character] = Object.keys(specialCharacters)
  const editor = mountEditor('')
  runAt(editor, `insert a special character ${character}`, [0, 0, 0, 0])
  expect(editor.getValue()).toEqual(character)
})

describe('snippet completers', () => {
  function complete(
    editor: Ace.Editor,
    index: number,
    prefix: string,
    column: number,
  ): jest.Mock {
    const callback = jest.fn()
    editor.completers[index].getCompletions(
      editor,
      editor.getSession(),
      { row: 0, column },
      prefix,
      callback,
    )
    return callback
  }

  test.each([
    [0, '@', 5, atSnippets],
    [1, '#', 1, hashSnippets],
  ])(
    'completer %i offers snippets for %p',
    (index, prefix, column, snippets) => {
      const editor = mountEditor('')
      expect(complete(editor, index, prefix, column)).toHaveBeenCalledWith(
        null,
        snippets,
      )
    },
  )

  test.each([
    [0, 'x', 1],
    [1, '#', 2],
    [1, 'x', 1],
  ])(
    'completer %i offers nothing for %p at column %i',
    (index, prefix, column) => {
      const editor = mountEditor('')
      expect(complete(editor, index, prefix, column)).not.toHaveBeenCalled()
    },
  )
})
