import React from 'react'
import { render, screen } from '@testing-library/react'
import { changeValueByLabel, submitForm } from 'test-support/utils'

import TemplateForm from './TemplateForm'

let onSubmit
let container: HTMLElement

async function submit(value) {
  changeValueByLabel(screen, 'Template', value)
  await submitForm(container)
}

function setup() {
  onSubmit = jest.fn()
  container = render(<TemplateForm onSubmit={onSubmit} />).container
}

it('Creates specified number of rows on observe', async () => {
  setup()
  await submit('3')
  expect(onSubmit).toBeCalledWith(`1. [...]  [...]
2. [...]  [...]
3. [...]  [...]`)
})

it('Creates specified number of rows obverse and reverse', async () => {
  setup()
  await submit('2, 3')
  expect(onSubmit).toBeCalledWith(`@obverse
1. [...]  [...]
2. [...]  [...]

@reverse
1. [...]  [...]
2. [...]  [...]
3. [...]  [...]`)
})

it('Adds suffix after row number', async () => {
  setup()
  await submit("1', 1#")
  expect(onSubmit).toBeCalledWith(`@obverse
1'. [...]  [...]

@reverse
1#. [...]  [...]`)
})

it('Does not call onSubmit if template is invalid', async () => {
  setup()
  await submit('invalid')
  expect(onSubmit).not.toHaveBeenCalled()
})

it('Does not call onSubmit if template is empty', async () => {
  setup()
  await submit('')
  expect(onSubmit).not.toHaveBeenCalled()
})

it('Update correctly', () => {
  setup()
  const value = '5,5'
  changeValueByLabel(screen, 'Template', value)
  expect(screen.getByLabelText('Template')).toHaveValue(value)
})
