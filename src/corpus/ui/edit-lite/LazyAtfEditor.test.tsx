import React, { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LazyAtfEditor from 'corpus/ui/edit-lite/LazyAtfEditor'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const name = 'translation-editor'
const label = 'Translation'

function StatefulEditor({ disabled }: { disabled?: boolean }): JSX.Element {
  const [value, setValue] = useState<string>('kur')
  return (
    <>
      <LazyAtfEditor
        name={name}
        label={label}
        value={value}
        onChange={setValue}
        disabled={disabled}
      />
      <button type="button">Elsewhere</button>
    </>
  )
}

function staticElement(): HTMLElement {
  return screen.getByRole('textbox', { name: label })
}

function editorInput(): HTMLElement {
  return screen.getByRole('textbox', { name })
}

function expectStatic(): void {
  expect(staticElement().tagName).toBe('PRE')
  expect(screen.queryByRole('textbox', { name })).not.toBeInTheDocument()
}

test('shows a static element and no editor until it is used', () => {
  render(<StatefulEditor />)

  expectStatic()
  expect(staticElement()).toHaveTextContent('kur')
  expect(staticElement()).toHaveAttribute('tabindex', '0')
  expect(staticElement()).toHaveAttribute('dir', 'auto')
  expect(staticElement()).toHaveAttribute('aria-disabled', 'false')
})

test('a click mounts the editor with the value and focuses it', async () => {
  render(<StatefulEditor />)
  await userEvent.click(staticElement())

  expect(editorInput()).toHaveValue('kur')
  expect(editorInput()).toHaveFocus()
  expect(screen.getByRole('group', { name: label })).toContainElement(
    editorInput(),
  )
  expect(screen.queryByRole('textbox', { name: label })).not.toBeInTheDocument()
})

test('keyboard focus mounts the editor', async () => {
  render(<StatefulEditor />)
  await userEvent.tab()

  expect(editorInput()).toHaveFocus()
})

test('the value survives going back to the static element on blur', async () => {
  render(<StatefulEditor />)
  await userEvent.click(staticElement())
  await userEvent.type(editorInput(), '-ra')

  expect(editorInput()).toHaveValue('kur-ra')

  await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))

  expectStatic()
  expect(staticElement()).toHaveTextContent('kur-ra')
})

test('the editor stays mounted while the focus moves inside it', async () => {
  render(<StatefulEditor />)
  await userEvent.click(staticElement())
  fireEvent.blur(editorInput(), { relatedTarget: editorInput() })

  expect(editorInput()).toBeInTheDocument()
})

test('the editor stays mounted after a blur that leaves the focus in it', async () => {
  render(<StatefulEditor />)
  await userEvent.click(staticElement())
  fireEvent.blur(editorInput())
  await userEvent.type(editorInput(), '-ra')

  expect(editorInput()).toHaveFocus()
  expect(editorInput()).toHaveValue('kur-ra')
})

test('a blur check that is still pending does not close a reopened editor', async () => {
  render(<StatefulEditor />)
  await userEvent.click(staticElement())
  fireEvent.blur(editorInput())
  fireEvent.keyDown(editorInput(), { key: 'Escape' })
  fireEvent.keyDown(staticElement(), { key: 'Enter' })
  await userEvent.type(editorInput(), '-ra')

  expect(editorInput()).toHaveFocus()
  expect(editorInput()).toHaveValue('kur-ra')
})

test('Escape returns to the focused static element without reopening', async () => {
  render(<StatefulEditor />)
  await userEvent.click(staticElement())
  await userEvent.type(editorInput(), '-ra{Escape}')

  expectStatic()
  expect(staticElement()).toHaveFocus()
  expect(staticElement()).toHaveTextContent('kur-ra')
})

test.each([['{Enter}'], ['a'], ['{Shift>}A{/Shift}']])(
  'pressing %s on the focused static element opens the editor',
  async (keys) => {
    render(<StatefulEditor />)
    await userEvent.click(staticElement())
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard(keys)

    expect(editorInput()).toHaveFocus()
    expect(editorInput()).toHaveValue('kur')
  },
)

test.each([['{ArrowDown}'], ['{Control>}a{/Control}'], ['{Alt>}a{/Alt}']])(
  'pressing %s on the focused static element does not open the editor',
  async (keys) => {
    render(<StatefulEditor />)
    await userEvent.click(staticElement())
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard(keys)

    expectStatic()
  },
)

test('a click reopens the editor after Escape', async () => {
  render(<StatefulEditor />)
  await userEvent.click(staticElement())
  await userEvent.keyboard('{Escape}')
  await userEvent.click(staticElement())

  expect(editorInput()).toHaveFocus()
})

test('a disabled editor cannot be opened', async () => {
  render(<StatefulEditor disabled />)
  await userEvent.click(staticElement())
  await userEvent.keyboard('{Enter}')

  expectStatic()
  expect(staticElement()).toHaveAttribute('aria-disabled', 'true')
})

test('disabling an open editor closes it', async () => {
  const { rerender } = render(<StatefulEditor />)
  await userEvent.click(staticElement())
  rerender(<StatefulEditor disabled />)

  expectStatic()

  rerender(<StatefulEditor />)

  expectStatic()
})
