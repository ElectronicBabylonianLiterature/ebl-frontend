import React, { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditLiteUncertainFragments, {
  emptyFragment,
} from 'corpus/ui/edit-lite/EditLiteUncertainFragments'

interface Props {
  readonly initialFragments: readonly string[]
  readonly onChange: (fragments: readonly string[]) => void
  readonly readOnly?: boolean
  readonly disabled?: boolean
}

function StatefulFragments({
  initialFragments,
  onChange,
  readOnly = false,
  disabled = false,
}: Props): JSX.Element {
  const [fragments, setFragments] =
    useState<readonly string[]>(initialFragments)
  return (
    <EditLiteUncertainFragments
      fragments={fragments}
      onChange={(changed: readonly string[]): void => {
        setFragments(changed)
        onChange(changed)
      }}
      readOnly={readOnly}
      disabled={disabled}
    />
  )
}

interface RenderedFragments {
  readonly onChange: jest.Mock<void, [readonly string[]]>
}

function renderFragments(props: Partial<Props> = {}): RenderedFragments {
  const onChange = jest.fn<void, [readonly string[]]>()
  render(
    <StatefulFragments
      initialFragments={['K.1', 'BM.2']}
      onChange={onChange}
      {...props}
    />,
  )
  return { onChange }
}

function button(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}

test('lists the fragments without any form control', () => {
  renderFragments()

  expect(
    screen.getByRole('region', { name: 'Uncertain fragments' }),
  ).toBeVisible()
  expect(button('Edit uncertain fragment K.1')).toHaveTextContent('K.1')
  expect(button('Edit uncertain fragment BM.2')).toHaveTextContent('BM.2')
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
})

test('says so when there are no uncertain fragments', () => {
  renderFragments({ initialFragments: [] })

  expect(
    screen.getByText('This chapter has no uncertain fragments.'),
  ).toBeVisible()
  expect(button('Add fragment')).toBeEnabled()
})

test('a fragment is edited in a lazily mounted input', async () => {
  const { onChange } = renderFragments()
  await userEvent.click(button('Edit uncertain fragment BM.2'))
  const input = screen.getByRole('textbox', { name: 'Museum Number' })

  expect(input).toHaveFocus()
  expect(input).toHaveValue('BM.2')
  expect(screen.getAllByRole('textbox')).toHaveLength(1)

  await userEvent.type(input, '3')

  expect(onChange).toHaveBeenLastCalledWith(['K.1', 'BM.23'])

  await userEvent.tab()

  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  expect(button('Edit uncertain fragment BM.23')).toBeVisible()
})

test('Add fragment appends an empty fragment that is ready for typing', async () => {
  const { onChange } = renderFragments()
  await userEvent.click(button('Add fragment'))

  expect(onChange).toHaveBeenLastCalledWith(['K.1', 'BM.2', ''])
  expect(screen.getByRole('textbox', { name: 'Museum Number' })).toHaveFocus()

  await userEvent.keyboard('Sm.7')

  expect(onChange).toHaveBeenLastCalledWith(['K.1', 'BM.2', 'Sm.7'])
})

test('an empty fragment is shown with a placeholder', async () => {
  renderFragments({ initialFragments: [''] })

  expect(button(`Edit uncertain fragment ${emptyFragment}`)).toHaveTextContent(
    emptyFragment,
  )
  expect(button(`Delete uncertain fragment ${emptyFragment}`)).toBeVisible()
})

test('Delete removes that fragment only', async () => {
  const { onChange } = renderFragments()
  await userEvent.click(button('Edit uncertain fragment K.1'))
  await userEvent.click(button('Delete uncertain fragment K.1'))

  expect(onChange).toHaveBeenLastCalledWith(['BM.2'])
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  expect(button('Edit uncertain fragment BM.2')).toBeVisible()
  expect(screen.queryByText('K.1')).not.toBeInTheDocument()
})

test('a disabled list cannot be changed', () => {
  renderFragments({ disabled: true })

  expect(button('Edit uncertain fragment K.1')).toBeDisabled()
  expect(button('Delete uncertain fragment K.1')).toBeDisabled()
  expect(button('Add fragment')).toBeDisabled()
})

test('a reader sees the fragments as plain text', () => {
  renderFragments({ readOnly: true })

  expect(screen.getByText('K.1')).toBeVisible()
  expect(screen.getByText('BM.2')).toBeVisible()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
})
