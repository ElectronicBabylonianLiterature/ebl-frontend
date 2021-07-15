import React from 'react'
import { column, object, surface } from 'test-support/lines/at'
import { lemmatized } from 'test-support/lines/text-lemmatization'
import { render, RenderResult, screen } from '@testing-library/react'
import Glossary from './Glossary'
import WordService from 'dictionary/application/WordService'
import { Text } from 'transliteration/domain/text'
import { MemoryRouter } from 'react-router-dom'
import { createDictionaryWord } from 'test-support/glossary'

let element: RenderResult

beforeEach(async () => {
  const [firstLine, secondLine] = lemmatized
  const text = new Text({
    lines: [firstLine, object, surface, column, secondLine],
  })
  const wordService = {
    find: jest.fn(),
  }

  wordService.find.mockImplementation(createDictionaryWord)

  element = render(
    <MemoryRouter>
      <Glossary
        text={text}
        wordService={(wordService as unknown) as WordService}
      />
    </MemoryRouter>
  )
})

test('Glossary snapshot', async () => {
  await screen.findByText('Glossary')
  expect(element.container).toMatchSnapshot()
})
