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
import Bluebird from 'bluebird'

jest.mock('dictionary/application/WordService')

let element: RenderResult

beforeEach(async () => {
  const [firstLine, secondLine] = lemmatized
  const text = new Text({
    lines: [firstLine, object, surface, column, secondLine],
  })
  const wordService = new (WordService as jest.Mock<WordService>)()
  jest
    .spyOn(wordService, 'find')
    .mockImplementation(
      (id) => new Bluebird((resolve) => createDictionaryWord(id).then(resolve))
    )

  element = render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <Glossary text={text} wordService={wordService} />
      </DictionaryContext.Provider>
    </MemoryRouter>
  )
})

test('Glossary snapshot', async () => {
  await screen.findByText('Glossary')
  expect(element.container).toMatchSnapshot()
})
