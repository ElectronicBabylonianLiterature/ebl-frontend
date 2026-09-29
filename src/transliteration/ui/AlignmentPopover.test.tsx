import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AlignmentPopover } from 'transliteration/ui/AlignmentPopover'
import { LineGroup } from 'transliteration/ui/LineGroup'
import {
  highlightIndexSetterMock,
  lemmatizableToken,
  lineInfo,
} from 'test-support/line-group-fixtures'
import { AkkadianWord, Token } from 'transliteration/domain/token'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import {
  createLemmaMap,
  LineLemmasContext,
} from 'transliteration/ui/LineLemmasContext'

jest.mock('dictionary/application/WordService')

const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
const lineLemmas = {
  lemmaMap: createLemmaMap(['ušurtu I']),
  lemmaSetter: jest.fn(),
}

const unlemmatizedToken: AkkadianWord = {
  ...(lemmatizableToken as AkkadianWord),
  uniqueLemma: [],
  sentenceIndex: 2,
}

const trigger = 'trigger'

function renderTrigger(
  token: Token,
  lineGroup: LineGroup,
  useRouterLinks = true,
) {
  return render(
    <MemoryRouter>
      <RouterLinkModeContext.Provider value={useRouterLinks}>
        <LineLemmasContext.Provider value={lineLemmas}>
          <DictionaryContext.Provider value={wordService}>
            <AlignmentPopover token={token} lineGroup={lineGroup}>
              {trigger}
            </AlignmentPopover>
          </DictionaryContext.Provider>
        </LineLemmasContext.Provider>
      </RouterLinkModeContext.Provider>
    </MemoryRouter>,
  )
}

describe('AlignmentPopover with unlemmatized word', () => {
  it('shows the trigger without a popover button', () => {
    const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)

    renderTrigger(unlemmatizedToken, lineGroup)

    expect(screen.getByText(trigger)).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('sets the active token index on hover', () => {
    const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)

    renderTrigger(unlemmatizedToken, lineGroup)

    fireEvent.mouseEnter(screen.getByText(trigger))
    expect(highlightIndexSetterMock).toHaveBeenCalledWith(2)
    expect(lineGroup.highlightIndex).toBe(2)
  })

  it('falls back to the first token index without a sentence index', () => {
    const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)

    renderTrigger({ ...unlemmatizedToken, sentenceIndex: 0 }, lineGroup)

    fireEvent.mouseEnter(screen.getByText(trigger))

    expect(lineGroup.highlightIndex).toBe(0)
  })

  it('resets the active token index on mouse leave', () => {
    const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)

    renderTrigger(unlemmatizedToken, lineGroup)

    fireEvent.mouseEnter(screen.getByText(trigger))
    fireEvent.mouseLeave(screen.getByText(trigger))

    expect(highlightIndexSetterMock).toHaveBeenCalledWith(0)
    expect(lineGroup.highlightIndex).toBe(0)
  })
})

describe('AlignmentPopover outside router link mode', () => {
  it('renders only the alignment indicator', () => {
    const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)

    renderTrigger(unlemmatizedToken, lineGroup, false)

    expect(screen.getByText(trigger)).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('AlignmentPopover with a lemmatized word', () => {
  beforeEach(() => {
    wordService.findAll.mockResolvedValue([])
  })

  it.each([
    [
      'a sentence index',
      { ...(lemmatizableToken as AkkadianWord), sentenceIndex: 3 },
      3,
    ],
    [
      'no sentence index',
      { ...(lemmatizableToken as AkkadianWord), sentenceIndex: 0 },
      0,
    ],
  ])(
    'tracks the active token index on hover for a token with %s',
    (unusedName, token, expected) => {
      const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)

      renderTrigger(token, lineGroup)

      fireEvent.mouseEnter(screen.getByRole('button'))
      expect(lineGroup.highlightIndex).toBe(expected)

      fireEvent.mouseLeave(screen.getByRole('button'))
      expect(lineGroup.highlightIndex).toBe(0)
    },
  )
})

describe('AlignmentPopover with a non-word token', () => {
  it('renders the children unchanged', () => {
    const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)

    renderTrigger(
      { type: 'ValueToken', value: '...', cleanValue: '...' } as Token,
      lineGroup,
    )

    expect(screen.getByText(trigger)).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
