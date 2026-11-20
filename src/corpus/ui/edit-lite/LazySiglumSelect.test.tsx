import React, { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { editLiteManuscripts } from 'corpus/ui/edit-lite/editLite.testSupport'
import LazySiglumSelect from 'corpus/ui/edit-lite/LazySiglumSelect'

interface Props {
  readonly initialValue?: number
  readonly disabled?: boolean
  readonly readOnly?: boolean
  readonly onChange?: (manuscriptId: number) => void
}

function StatefulSelect({
  initialValue = 1,
  disabled,
  readOnly,
  onChange,
}: Props): JSX.Element {
  const [value, setValue] = useState<number>(initialValue)
  return (
    <>
      <LazySiglumSelect
        value={value}
        manuscripts={editLiteManuscripts}
        onChange={(manuscriptId: number): void => {
          setValue(manuscriptId)
          onChange?.(manuscriptId)
        }}
        disabled={disabled}
        readOnly={readOnly}
      />
      <button type="button">Elsewhere</button>
    </>
  )
}

function expectStatic(siglum: string): void {
  expect(
    screen.getByRole('button', { name: `Siglum ${siglum}` }),
  ).toHaveTextContent(siglum)
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  expect(screen.queryByRole('option')).not.toBeInTheDocument()
}

test('shows the siglum as a button without any options', () => {
  render(<StatefulSelect />)

  expectStatic('NinNA1a')
})

test('a click turns it into a focused select with all manuscripts', async () => {
  render(<StatefulSelect />)
  await userEvent.click(screen.getByRole('button', { name: 'Siglum NinNA1a' }))
  const select = screen.getByRole('combobox', { name: 'Siglum' })

  expect(select).toHaveFocus()
  expect(select).toHaveValue('1')
  expect(
    screen.getAllByRole('option').map((option) => option.textContent),
  ).toEqual(['NinNA1a', 'BabaNBSch1'])
})

test('selecting a manuscript reports its id and blur goes back', async () => {
  const onChange = jest.fn()
  render(<StatefulSelect onChange={onChange} />)
  await userEvent.tab()
  await userEvent.selectOptions(screen.getByRole('combobox'), 'BabaNBSch1')

  expect(onChange).toHaveBeenCalledWith(2)
  expect(screen.getByRole('combobox')).toHaveValue('2')

  await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))

  expectStatic('BabaNBSch1')
})

test('an unknown manuscript is shown with a placeholder', async () => {
  render(<StatefulSelect initialValue={0} />)

  expectStatic('<unknown>')

  await userEvent.click(
    screen.getByRole('button', { name: 'Siglum <unknown>' }),
  )

  expect(screen.getByRole('combobox')).toHaveValue('0')
  expect(screen.getByRole('option', { name: '<unknown>' })).toBeDisabled()
  expect(screen.getAllByRole('option')).toHaveLength(3)
})

test('a disabled select cannot be opened', async () => {
  render(<StatefulSelect disabled />)
  await userEvent.click(screen.getByRole('button', { name: 'Siglum NinNA1a' }))

  expect(screen.getByRole('button', { name: 'Siglum NinNA1a' })).toBeDisabled()
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('disabling an open select closes it', async () => {
  const { rerender } = render(<StatefulSelect />)
  await userEvent.click(screen.getByRole('button', { name: 'Siglum NinNA1a' }))
  rerender(<StatefulSelect disabled />)

  expectStatic('NinNA1a')
})

test('a read-only siglum is plain text that cannot be opened', async () => {
  render(<StatefulSelect readOnly />)

  expect(screen.getByText('NinNA1a')).toHaveTextContent(/^Siglum NinNA1a$/)
  expect(
    screen.queryByRole('button', { name: /^Siglum/ }),
  ).not.toBeInTheDocument()

  await userEvent.click(screen.getByText('NinNA1a'))

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('a read-only siglum of an unknown manuscript shows the placeholder', () => {
  render(<StatefulSelect initialValue={7} readOnly />)

  expect(screen.getByText('<unknown>')).toBeVisible()
})

test('making an open select read-only closes it', async () => {
  const { rerender } = render(<StatefulSelect />)
  await userEvent.click(screen.getByRole('button', { name: 'Siglum NinNA1a' }))
  rerender(<StatefulSelect readOnly />)

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  expect(screen.getByText('NinNA1a')).toBeVisible()
})
