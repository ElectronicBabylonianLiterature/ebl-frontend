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

async function renderFragment(fragment: Fragment) {
  render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <Display fragment={fragment} wordService={wordService} activeLine="" />
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )

  await waitFor(() =>
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument(),
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
    { associations: { text: complexText } },
  )
  await renderFragment(fragment)
  expect(screen.getByText(/lorem ipsum quia/i)).toBeInTheDocument()
  expect(screen.getByText(/eBL Notes/i)).toBeInTheDocument()
  expect(screen.getByText(/dolor sit amet/i)).toBeInTheDocument()
})
describe('Translation display layouts', () => {
  it('shows the layout controls', async () => {
    await renderFragment(translatedFragment)
    expect(screen.getByLabelText('toggle-layout')).toBeVisible()
    expect(screen.getByLabelText('switch-language')).toBeVisible()
  })
  it('toggles the layout', async () => {
    await renderFragment(translatedFragment)
    expect(screen.getByTestId('translation-for-line-0')).toHaveClass(
      'TranslationColumn',
    )

    screen.getByLabelText('toggle-layout').click()

    await waitFor(() => {
      expect(screen.getByText(/en\s*:/)).toBeInTheDocument()
    })
    expect(
      screen.queryByTestId('translation-for-line-0'),
    ).not.toBeInTheDocument()
  })
  it('switches the language', async () => {
    await renderFragment(translatedFragment)
    screen.getByLabelText('switch-language').click()
    await waitFor(() => {
      expect(screen.queryByText('English translation')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Arabic translation')).toBeInTheDocument()
  })
})
