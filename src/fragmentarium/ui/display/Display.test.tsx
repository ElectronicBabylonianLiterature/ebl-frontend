import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Fragment } from 'fragmentarium/domain/fragment'
import complexText from 'test-support/complexTestText'
import WordService from 'dictionary/application/WordService'
import Display from './Display'
import { MemoryRouter } from 'react-router-dom'
import {
  fragmentFactory,
  translatedFragment,
} from 'test-support/fragment-fixtures'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import Bluebird from 'bluebird'
import { createDictionaryWord } from 'test-support/glossary'

jest.mock('dictionary/application/WordService')

let wordService: WordService
let fragment: Fragment
let container: Element

async function renderFragment(fragment: Fragment) {
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
}

beforeEach(async () => {
  wordService = new (WordService as jest.Mock<WordService>)()
  jest.spyOn(wordService, 'findAll').mockImplementation((ids) => {
    const words = [...new Set(ids)].map((id) => createDictionaryWord(id))
    return Bluebird.resolve(words)
  })
})

it('correctly displays simple fragments', async () => {
  fragment = fragmentFactory.build(
    {
      notes: {
        text: 'lorem ipsum quia @i{dolor sit amet}',
        parts: [
          { text: 'lorem ipsum quia ', type: 'StringPart' },
          { text: 'dolor sit amet', type: 'EmphasisPart' },
        ],
      },
      publication: 'Guod cigipli epibif odepuwu.',
      description:
        'Balbodduh lifuseb wuuk nasu hulwajo ho hiskuk riwa eldat ivu jandara nosrina abike befukiz ravsus.\nZut uzzejum ub mil ika roppar zewize ipifac vut eci avimez cewmikjov kiwso zamli jecja now.',
    },
    { associations: { text: complexText } }
  )
  await renderFragment(fragment)
  expect(container).toMatchSnapshot()
})
describe('Translation display layouts', () => {
  beforeEach(async () => {
    await renderFragment(translatedFragment)
  })
  it('shows the layout controls', () => {
    expect(screen.getByLabelText('toggle-layout')).toBeVisible()
    expect(screen.getByLabelText('switch-language')).toBeVisible()
  })
  it('toggles the layout', async () => {
    await waitFor(async () => {
      screen.getByLabelText('toggle-layout').click()

      expect(screen.queryByText(/en\s*:/)).not.toBeInTheDocument()
      expect(screen.getByTestId('translation-for-line-0')).toHaveClass(
        'TranslationColumn'
      )
    })
  })
  it('switches the language', async () => {
    await waitFor(async () => {
      screen.getByLabelText('switch-language').click()
      expect(screen.queryByText('English translation')).not.toBeInTheDocument()
      expect(screen.getByText('Arabic translation')).toBeInTheDocument()
    })
  })
})
