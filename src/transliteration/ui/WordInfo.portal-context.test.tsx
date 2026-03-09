import React, { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LemmaPopover } from './WordInfo'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { LineLemmasContext, createLemmaMap } from './LineLemmasContext'
import WordService from 'dictionary/application/WordService'
import DictionaryWord from 'dictionary/domain/Word'
import { MemoryRouter } from 'react-router-dom'
import Bluebird from 'bluebird'
import { Word } from 'transliteration/domain/token'
import {
  dictionaryWord,
  word as wordFixture,
} from 'test-support/word-info-fixtures'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()

const testToken: Word = {
  ...wordFixture,
  uniqueLemma: ['test-lemma-id'],
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const [lemmaMap, lemmaSetter] = useState(createLemmaMap(['test-lemma-id']))

  return (
    <MemoryRouter>
      <DictionaryContext.Provider value={wordServiceMock}>
        <LineLemmasContext.Provider
          value={{
            lemmaMap,
            lemmaSetter,
          }}
        >
          {children}
        </LineLemmasContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>
  )
}

describe('LemmaPopover portal context', () => {
  beforeEach(() => {
    wordServiceMock.find.mockReturnValue(Bluebird.resolve(dictionaryWord))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders lemma information in popover', async () => {
    render(
      <TestWrapper>
        <LemmaPopover token={testToken}>
          <span>test word</span>
        </LemmaPopover>
      </TestWrapper>,
    )

    await userEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(wordServiceMock.find).toHaveBeenCalledWith('test-lemma-id')
    })
  })

  it('displays dictionary word details in popover', async () => {
    render(
      <TestWrapper>
        <LemmaPopover token={testToken}>
          <span>test word</span>
        </LemmaPopover>
      </TestWrapper>,
    )

    await userEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(dictionaryWord.lemma.join(' '))).toBeVisible()
    })
  })

  it('renders content only once without duplication', async () => {
    render(
      <TestWrapper>
        <LemmaPopover token={testToken}>
          <span>test word</span>
        </LemmaPopover>
      </TestWrapper>,
    )

    await userEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toBeInTheDocument()
    })

    await waitFor(() => {
      const lemmaElements = screen.getAllByText(dictionaryWord.lemma.join(' '))
      expect(lemmaElements).toHaveLength(1)
    })
  })

  it('provides context to nested components in portal', async () => {
    const contextSpy = jest.fn()

    function ContextConsumer() {
      const context = React.useContext(LineLemmasContext)
      React.useEffect(() => {
        if (context) {
          contextSpy(context)
        }
      }, [context])
      return null
    }

    wordServiceMock.find.mockReturnValue(
      Bluebird.resolve({
        ...dictionaryWord,
        _id: 'test-lemma-id',
      } as DictionaryWord),
    )

    render(
      <TestWrapper>
        <LemmaPopover token={testToken}>
          <span>test word</span>
        </LemmaPopover>
        <ContextConsumer />
      </TestWrapper>,
    )

    await userEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(contextSpy).toHaveBeenCalled()
    })

    const [context] = contextSpy.mock.calls[0]
    expect(context).toHaveProperty('lemmaMap')
    expect(context).toHaveProperty('lemmaSetter')
  })

  it('closes popover when clicking outside', async () => {
    render(
      <TestWrapper>
        <div>
          <LemmaPopover token={testToken}>
            <span>test word</span>
          </LemmaPopover>
          <div data-testid="outside">outside element</div>
        </div>
      </TestWrapper>,
    )

    await userEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('outside'))

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })
})
