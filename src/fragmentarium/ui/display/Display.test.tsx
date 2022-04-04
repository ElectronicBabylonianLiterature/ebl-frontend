import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Fragment } from 'fragmentarium/domain/fragment'
import complexText from 'test-support/complexTestText'
import WordService from 'dictionary/application/WordService'
import Display from './Display'
import { wordDto } from 'test-support/test-word'
import { MemoryRouter } from 'react-router-dom'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import Bluebird from 'bluebird'

jest.mock('dictionary/application/WordService')

let wordService: WordService
let fragment: Fragment
let container: Element

beforeEach(async () => {
  wordService = new (WordService as jest.Mock<WordService>)()
  jest
    .spyOn(wordService, 'find')
    .mockImplementation(() => Bluebird.resolve(wordDto))
  fragment = fragmentFactory.build(
    {
      notes: 'lorem ipsum quia dolor sit amet',
      publication: 'Guod cigipli epibif odepuwu.',
      description:
        'Balbodduh lifuseb wuuk nasu hulwajo ho hiskuk riwa eldat ivu jandara nosrina abike befukiz ravsus.\nZut uzzejum ub mil ika roppar zewize ipifac vut eci avimez cewmikjov kiwso zamli jecja now.',
    },
    { associations: { text: complexText } }
  )
  container = render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <Display fragment={fragment} wordService={wordService} activeLine="" />
      </DictionaryContext.Provider>
    </MemoryRouter>
  ).container

  await waitFor(() =>
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  )
})

test(`Renders header`, () => {
  expect(container).toHaveTextContent(fragment.publication)
})

test('Snapshot', () => {
  expect(container).toMatchSnapshot()
})
