import React from 'react'
import { render } from 'react-testing-library'
import { changeValueByLabel, submitForm } from 'testHelpers'

import TemplateForm from './TemplateForm'
import { changeValue } from '../../testHelpers';

let onSubmit
let element

async function submit (value) {
  await changeValueByLabel(element, 'Template', value)
  await submitForm(element, 'form')
}

beforeEach(() => {
  onSubmit = jest.fn()
  element = render(<TemplateForm onSubmit={onSubmit} />)
})

it('Creates specified number of rows on observe', async () => {
  await submit('3')
  expect(onSubmit).toBeCalledWith(`1. [...]  [...]
2. [...]  [...]
3. [...]  [...]`)
})

it('Creates specified number of rows obverse and reverse', async () => {
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
  await submit('1\', 1#')
  expect(onSubmit).toBeCalledWith(`@obverse
1'. [...]  [...]

@reverse
1#. [...]  [...]`)
})

it('Does not call onSubmit if template is invalid', async () => {
  await submit('invalid')
  expect(onSubmit).not.toHaveBeenCalled()
})

it('Does not call onSubmit if template is empty', async () => {
  await submit('')
  expect(onSubmit).not.toHaveBeenCalled()
})

it('Update correctly', async () => {
  const value = '5,5'
  await changeValueByLabel(element, 'Template', value)
  expect(element.getByLabelText('Template').value).toEqual(value)
})
