import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
import { WithRealiaService } from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { annotatedFragment } from 'test-support/named-entity-fixtures'

jest.mock('dictionary/application/WordService')
jest.mock('realia/application/RealiaService')

let wordService: WordService
let fragment: Fragment

async function renderFragment(fragment: Fragment) {
  const view = render(
    <MemoryRouter>
      <WithRealiaService>
        <DictionaryContext.Provider value={wordService}>
          <Display
            fragment={fragment}
            wordService={wordService}
            activeLine=""
          />
        </DictionaryContext.Provider>
      </WithRealiaService>
    </MemoryRouter>,
  )

  await waitFor(() =>
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument(),
  )

  return view
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
  const view = await renderFragment(fragment)
  expect(view.container).toMatchSnapshot()
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

    await userEvent.click(screen.getByLabelText('toggle-layout'))

    await waitFor(() => {
      expect(screen.getByText(/en\s*:/)).toBeInTheDocument()
    })
    expect(
      screen.queryByTestId('translation-for-line-0'),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('toggle-layout'))

    expect(await screen.findByTestId('translation-for-line-0')).toHaveClass(
      'TranslationColumn',
    )
  })
  it('switches the language', async () => {
    await renderFragment(translatedFragment)
    await userEvent.click(screen.getByLabelText('switch-language'))
    await waitFor(() => {
      expect(screen.queryByText('English translation')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Arabic translation')).toBeInTheDocument()
  })
})
describe('Named entity preview', () => {
  it('shows the toggle without translation controls', async () => {
    await renderFragment(annotatedFragment)

    expect(screen.getByLabelText('toggle-named-entities')).toBeVisible()
    expect(screen.queryByLabelText('toggle-layout')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('switch-language')).not.toBeInTheDocument()
  })

  it('hides the named entities by default', async () => {
    await renderFragment(annotatedFragment)

    expect(screen.getByLabelText('toggle-named-entities')).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.queryByTestId('Word-2__Entity-1')).not.toBeInTheDocument()
  })

  it('shows the named entity and realia spans when toggled on', async () => {
    await renderFragment(annotatedFragment)

    await userEvent.click(screen.getByLabelText('toggle-named-entities'))

    expect(await screen.findByTestId('Word-2__Entity-1')).toHaveClass(
      'named-entity__PERSONAL_NAME',
    )
    expect(screen.getByTestId('Word-3__Realia-1')).toHaveAttribute(
      'data-label',
      'realia_000846',
    )
    expect(screen.getByLabelText('toggle-named-entities')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('hides the named entities when toggled off again', async () => {
    await renderFragment(annotatedFragment)
    const toggle = screen.getByLabelText('toggle-named-entities')

    await userEvent.click(toggle)
    expect(await screen.findByTestId('Word-2__Entity-1')).toBeVisible()

    await userEvent.click(toggle)

    await waitFor(() =>
      expect(screen.queryByTestId('Word-2__Entity-1')).not.toBeInTheDocument(),
    )
  })
})
