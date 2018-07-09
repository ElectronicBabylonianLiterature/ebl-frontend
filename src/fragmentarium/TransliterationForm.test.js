import React from 'react'
import {render, cleanup} from 'react-testing-library'
import { changeValueByLabel } from 'testHelpers'

import TransliteratioForm from './TransliterationForm'

const transliteration = 'line1\nline2'

let element

afterEach(cleanup)

beforeEach(() => {
  element = render(<TransliteratioForm transliteration={transliteration} />)
})

it('Shows transliteration', () => {
  expect(element.getByLabelText('Transliteration').value).toEqual(transliteration)
})

it('Updates transliteration on change', async () => {
  const newTransliteration = 'line1\nline2\nnew line'
  await changeValueByLabel(element, 'Transliteration', newTransliteration)

  expect(element.getByLabelText('Transliteration').value).toEqual(newTransliteration)
})
