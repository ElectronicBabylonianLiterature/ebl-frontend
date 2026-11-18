import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MemorySession, { guestSession } from 'auth/Session'
import SessionContext from 'auth/SessionContext'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import { Text } from 'transliteration/domain/text'
import { Transliteration } from 'transliteration/ui/Transliteration'
import { TranslationStyle } from 'transliteration/ui/TransliterationLines'
import { lemmatized } from 'test-support/lines/text-lemmatization'
import note from 'test-support/lines/note'
import { singleRuling } from 'test-support/lines/dollar'
import {
  arabicTranslationLine,
  englishTranslationLine,
} from 'test-support/lines/translation-lines'

jest.mock('dictionary/application/WordService')

const text = new Text({
  lines: [
    note,
    lemmatized[0],
    note,
    englishTranslationLine,
    note,
    note,
    arabicTranslationLine,
    note,
    singleRuling,
    lemmatized[1],
    note,
    englishTranslationLine,
    note,
  ],
})

const layouts: [TranslationStyle, string | undefined][] = [
  ['inline', undefined],
  ['inline', 'en'],
  ['inline', 'ar'],
  ['standoff', undefined],
  ['standoff', 'en'],
  ['standoff', 'ar'],
]

const sessions = [
  ['guest', guestSession],
  ['authenticated', new MemorySession(['read:fragments', 'read:bibliography'])],
] as const

function renderText(
  translationStyle: TranslationStyle,
  language: string | undefined,
  session: typeof guestSession,
  currentText = text,
): void {
  render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <DictionaryContext.Provider
          value={new (WordService as jest.Mock<WordService>)()}
        >
          <Transliteration
            text={currentText}
            translationStyle={translationStyle}
            language={language}
          />
        </DictionaryContext.Provider>
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

function getLineTarget(id: string): HTMLElement {
  return screen.getByText((_content, element) => element?.id === id)
}

function expectWorkingNoteLinks(count: number): void {
  const notes = screen.getAllByRole('listitem')
  expect(notes).toHaveLength(count)
  notes.forEach((noteElement, index) => {
    const number = String(index + 1)
    const backlink = within(noteElement).getByRole('link', { name: number })
    const targetId = backlink.getAttribute('href')?.slice(1)
    expect(targetId).toBeDefined()
    expect(getLineTarget(targetId ?? '')).toBeInTheDocument()
    const marker = within(screen.getByRole('table')).getByRole('link', {
      name: number,
    })
    expect(marker).toHaveAttribute('href', `#note-${number}`)
    expect(noteElement).toHaveAttribute('id', `note-${number}`)
  })
}

describe.each(sessions)('%s session', (_name, session) => {
  test.each(layouts)(
    '%s layout with %s translations keeps all footnotes reachable',
    (translationStyle, language) => {
      renderText(translationStyle, language, session)
      expectWorkingNoteLinks(7)
    },
  )
})

test('standoff translation notes return to the associated source row', () => {
  renderText('standoff', 'en', guestSession)
  const firstRow = getLineTarget('line-1')
  expect(firstRow).toContainElement(getLineTarget('line-2'))
  expect(firstRow).toContainElement(getLineTarget('line-3'))
  expect(getLineTarget('line-5')).toContainElement(getLineTarget('line-6'))
  expect(
    within(firstRow).getAllByRole('link', { name: /^[2-5]$/ }),
  ).toHaveLength(4)
})

test.each(layouts)(
  'leading translation notes remain reachable in %s layout with %s',
  (translationStyle, language) => {
    renderText(
      translationStyle,
      language,
      guestSession,
      new Text({
        lines: [englishTranslationLine, note, arabicTranslationLine, note],
      }),
    )
    expectWorkingNoteLinks(2)
  },
)
