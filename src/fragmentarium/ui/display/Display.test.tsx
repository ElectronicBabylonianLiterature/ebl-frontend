import React from 'react'
import { act, render, RenderResult, waitFor } from '@testing-library/react'
import { factory } from 'factory-girl'
import { Fragment } from 'fragmentarium/domain/fragment'
import complexText from 'test-support/complexTestText'
import WordService from 'dictionary/application/WordService'
import Display from './Display'
import { wordDto } from 'test-support/test-word'
import { MemoryRouter } from 'react-router-dom'
import exp from 'constants'

jest.mock('dictionary/application/WordService')

let wordService
let fragment: Fragment
let element: RenderResult
let container: Element

beforeEach(async () => {
  wordService = new WordService(null)
  jest
    .spyOn(wordService, 'find')
    .mockImplementation(() => Promise.resolve(wordDto))
  fragment = await factory.build('fragment', {
    publication: 'Guod cigipli epibif odepuwu.',
    text: complexText,
    description:
      'Balbodduh lifuseb wuuk nasu hulwajo ho hiskuk riwa eldat ivu jandara nosrina abike befukiz ravsus.\nZut uzzejum ub mil ika roppar zewize ipifac vut eci avimez cewmikjov kiwso zamli jecja now.',
  })
  await act(async () => {
    element = render(
      <MemoryRouter>
        <Display fragment={fragment} wordService={wordService} />
      </MemoryRouter>
    )
  })
  container = element.container
})

test(`Renders header`, () => {
  expect(container).toHaveTextContent(fragment.publication)
})

test('Snapshot', async () => {
  expect(container).toMatchSnapshot()
})
