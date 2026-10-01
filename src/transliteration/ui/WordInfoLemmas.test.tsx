import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import WordService from 'dictionary/application/WordService'
import LemmaInfo from 'transliteration/ui/WordInfoLemmas'
import { LineLemmasContext } from 'transliteration/ui/LineLemmasContext'
import { lemmatizableToken } from 'test-support/line-group-fixtures'
import { dictionaryWord } from 'test-support/word-info-fixtures'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import { isAnyWord } from 'transliteration/domain/type-guards'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>

test.each([true, false])(
  'shows known lemmas without querying the dictionary with router links %s',
  (useRouterLinks) => {
    const dictionary = new MockWordService()
    const word = [lemmatizableToken].filter(isAnyWord)[0]
    render(
      <MemoryRouter>
        <RouterLinkModeContext.Provider value={useRouterLinks}>
          <LineLemmasContext.Provider
            value={{
              lemmaMap: new Map([['ušurtu I', dictionaryWord]]),
              lemmaSetter: jest.fn(),
            }}
          >
            <LemmaInfo word={word} dictionary={dictionary} />
          </LineLemmasContext.Provider>
        </RouterLinkModeContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.getByText(dictionaryWord.lemma.join(' '))).toBeVisible()
    expect(dictionary.find).not.toHaveBeenCalled()
    const link = screen.getByRole('link', {
      name: 'Open the word in the Dictionary.',
    })
    expect(decodeURI(link.getAttribute('href') ?? '')).toEqual(
      `/dictionary/${dictionaryWord._id}`,
    )
  },
)
