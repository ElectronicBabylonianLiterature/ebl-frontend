import React from 'react'
import { column, object, surface } from 'test-support/lines/at'
import { lemmatized } from 'test-support/lines/text-lemmatization'
import { render, RenderResult } from '@testing-library/react'
import Glossary from './Glossary'
import WordService from 'dictionary/application/WordService'
import { Text } from 'transliteration/domain/text'
import { act } from 'react-dom/test-utils'
import { factory } from 'factory-girl'
import { MemoryRouter } from 'react-router-dom'

let element: RenderResult

beforeEach(async () => {
  const [firstLine, secondLine] = lemmatized
  const text = new Text({
    lines: [firstLine, object, surface, column, secondLine],
  })
  const wordService = {
    find: jest.fn(),
  }

  wordService.find.mockImplementation(async (wordId) => {
    const [lemma, homonym] = wordId.split(' ')
    return await factory.build('word', {
      _id: wordId,
      lemma: [lemma],
      homonym: homonym,
      guideWord: `GW for ${wordId}`,
    })
  })

  await act(async () => {
    element = render(
      <MemoryRouter>
        <Glossary
          text={text}
          wordService={(wordService as unknown) as WordService}
        />
      </MemoryRouter>
    )
  })
})

test('Glossary snapshot', () => {
  expect(element.container).toMatchSnapshot()
})
