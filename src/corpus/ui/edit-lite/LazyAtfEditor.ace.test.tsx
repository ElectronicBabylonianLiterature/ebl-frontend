import React, { useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { edit } from 'ace-builds'
import LazyAtfEditor from 'corpus/ui/edit-lite/LazyAtfEditor'

const name = 'translation-editor'
const label = 'Translation'

function StatefulEditor(): JSX.Element {
  const [value, setValue] = useState<string>('kur')
  return (
    <>
      <LazyAtfEditor
        name={name}
        label={label}
        value={value}
        onChange={setValue}
      />
      <button type="button">Elsewhere</button>
      <p>Plain text</p>
    </>
  )
}

function aceTextInput(): HTMLElement | null {
  return screen.queryByRole('textbox', { name: /^Translation-editor, / })
}

test('mounts the real Ace editor only while the field is in use', async () => {
  render(<StatefulEditor />)

  expect(aceTextInput()).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('textbox', { name: label }))
  const editor = edit(name)

  expect(aceTextInput()).toHaveFocus()
  expect(editor.isFocused()).toBe(true)
  expect(editor.getValue()).toBe('kur')
  expect(editor.getCursorPosition()).toEqual({ row: 0, column: 3 })

  act(() => {
    editor.insert('-ra')
  })

  expect(editor.getValue()).toBe('kur-ra')

  await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))

  expect(aceTextInput()).not.toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: label })).toHaveTextContent(
    'kur-ra',
  )
})

test('Escape leaves the real Ace editor and keeps the focus on the field', async () => {
  render(<StatefulEditor />)
  await userEvent.click(screen.getByRole('textbox', { name: label }))
  await userEvent.keyboard('{Escape}')

  expect(aceTextInput()).not.toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: label })).toHaveFocus()

  await userEvent.keyboard('{Enter}')

  expect(aceTextInput()).toHaveFocus()
})

test('a button of the search box of Ace works and keeps the editor', async () => {
  render(<StatefulEditor />)
  await userEvent.click(screen.getByRole('textbox', { name: label }))
  act(() => {
    edit(name).execCommand('find')
  })

  expect(screen.getByPlaceholderText('Search for')).toHaveFocus()

  await userEvent.click(screen.getByTitle('RegExp Search'))

  expect(aceTextInput()).toBeInTheDocument()
  expect(screen.getByTitle('RegExp Search')).toHaveClass('checked')
  expect(screen.getByPlaceholderText('Search for')).toHaveFocus()
})

test('Ace keeps the editor when it cancels a composition', async () => {
  render(<StatefulEditor />)
  await userEvent.click(screen.getByRole('textbox', { name: label }))
  const editor = edit(name)
  fireEvent.compositionStart(editor.textInput.getElement())
  fireEvent.mouseDown(editor.renderer.getMouseEventTarget())
  await userEvent.keyboard('{Shift}')

  expect(aceTextInput()).toHaveFocus()
})

test('a click on plain text leaves the real Ace editor', async () => {
  render(<StatefulEditor />)
  await userEvent.click(screen.getByRole('textbox', { name: label }))
  await userEvent.click(screen.getByText('Plain text'))

  expect(await screen.findByRole('textbox', { name: label })).toHaveTextContent(
    'kur',
  )
  expect(aceTextInput()).not.toBeInTheDocument()
})
