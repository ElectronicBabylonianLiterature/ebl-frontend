import React from 'react'
import { column, object, surface } from 'test-support/lines/at'
import { lemmatized } from 'test-support/lines/text-lemmatization'
import { render, RenderResult, screen } from '@testing-library/react'
import Glossary from './Glossary'
import WordService from 'dictionary/application/WordService'
import { Text } from 'transliteration/domain/text'
import { MemoryRouter } from 'react-router-dom'
import { createDictionaryWord } from 'test-support/glossary'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { Promise } from 'bluebird'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

jest.mock('dictionary/application/WordService')

async function setup(): Promise<RenderResult> {
  const [firstLine, secondLine] = lemmatized
  const text = new Text({
    lines: [firstLine, object, surface, column, secondLine],
  })
  const wordService = new (WordService as jest.Mock<WordService>)()
  jest.spyOn(wordService, 'findAll').mockImplementation((ids) => {
    const words = [...new Set(ids)].map((id) => createDictionaryWord(id))
    return Promise.resolve(words)
  })

  const view = render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <Glossary text={text} wordService={wordService} />
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )
  await waitForSpinnerToBeRemoved(screen)
  return view
}

test('Glossary snapshot', async () => {
  const view = await setup()
  await screen.findByText('Glossary')
  expect(view.container).toMatchSnapshot()
})
