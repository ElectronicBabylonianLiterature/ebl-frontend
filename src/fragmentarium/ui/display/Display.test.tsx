import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { factory } from 'factory-girl'
import { Fragment } from 'fragmentarium/domain/fragment'
import complexText from 'test-helpers/complexTestText'
import WordService from 'dictionary/application/WordService'
import Display from './Display'

jest.mock('dictionary/application/WordService')

let wordService
let fragment: Fragment
let element: RenderResult
let container: HTMLElement

beforeEach(async () => {
  wordService = new WordService(null)
  fragment = await factory.build('fragment', {
    publication: 'Guod cigipli epibif odepuwu.',
    text: complexText,
    description:
      'Balbodduh lifuseb wuuk nasu hulwajo ho hiskuk riwa eldat ivu jandara nosrina abike befukiz ravsus.\nZut uzzejum ub mil ika roppar zewize ipifac vut eci avimez cewmikjov kiwso zamli jecja now.',
  })
  element = render(<Display fragment={fragment} wordService={wordService} />)
  container = element.container
})

test(`Renders header`, () => {
  expect(container).toHaveTextContent(fragment.publication)
})

test('Snapshot', () => {
  expect(container).toMatchSnapshot()
})
