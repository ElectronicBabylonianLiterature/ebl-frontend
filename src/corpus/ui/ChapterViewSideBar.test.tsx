import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SideBar } from 'corpus/ui/ChapterViewSideBar'
import RowsContext, { useRowsContext } from 'corpus/ui/RowsContext'
import TranslationContext, {
  useTranslationContext,
} from 'corpus/ui/TranslationContext'
import { ChapterDisplay } from 'corpus/domain/chapter'
import TranslationLine from 'transliteration/domain/translation-line'
import {
  chapterDisplayFactory,
  lineDisplayFactory,
} from 'test-support/chapter-fixtures'

const translationLine = (language: string): TranslationLine =>
  new TranslationLine({
    language,
    extent: null,
    parts: [{ text: 'translation', type: 'StringPart' }],
    content: [],
  })

const chapter = chapterDisplayFactory.build({
  lines: [
    lineDisplayFactory.build({
      translation: [
        translationLine('en'),
        translationLine('la'),
        translationLine('not a language'),
        translationLine('zz'),
      ],
    }),
  ],
  record: {
    authors: [],
    translators: [
      { name: 'Smith', prefix: 'J.', orcidNumber: '', language: 'en' },
      { name: 'Jones', prefix: 'K.', orcidNumber: '', language: 'en' },
    ],
    publicationDate: '',
  },
})

function SideBarWithContexts({
  chapter,
  numberOfRows,
}: {
  chapter: ChapterDisplay
  numberOfRows: number
}): JSX.Element {
  return (
    <RowsContext.Provider value={useRowsContext(numberOfRows)}>
      <TranslationContext.Provider value={useTranslationContext()}>
        <SideBar chapter={chapter} />
      </TranslationContext.Provider>
    </RowsContext.Provider>
  )
}

async function openSettings(numberOfRows = 1): Promise<void> {
  render(<SideBarWithContexts chapter={chapter} numberOfRows={numberOfRows} />)
  await userEvent.click(screen.getByRole('button', { name: /Settings/ }))
}

it('shows the translators of a language', async () => {
  await openSettings()
  expect(screen.getByText('Smith/Jones')).toBeVisible()
})

it('shows the display names of the languages', async () => {
  await openSettings()
  expect(screen.getByText('English')).toBeVisible()
  expect(screen.getByText('Lingua latina')).toBeVisible()
})

it('falls back to the language code for an invalid language tag', async () => {
  await openSettings()
  expect(screen.getByText('not a language')).toBeVisible()
})

it('falls back to the language code for an unknown language', async () => {
  await openSettings()
  expect(screen.getByText('zz')).toBeVisible()
})

it('marks the selected language as active', async () => {
  await openSettings()
  await userEvent.click(screen.getByText('Lingua latina'))
  expect(screen.getByText('Lingua latina')).toHaveClass(
    'settings__language settings__language--active',
  )
  expect(screen.getByText('English')).not.toHaveClass(
    'settings__language--active',
  )
})

it('expands and closes a setting for all rows', async () => {
  await openSettings(2)
  const score = screen.getByLabelText('Score')
  expect(score).not.toBeChecked()
  await userEvent.click(score)
  expect(screen.getByLabelText('Score')).toBeChecked()
  await userEvent.click(screen.getByLabelText('Score'))
  expect(screen.getByLabelText('Score')).not.toBeChecked()
})

it('leaves the switches unchecked without rows', async () => {
  await openSettings(0)
  expect(screen.getByLabelText('Phonetic transcription')).not.toBeChecked()
})

it('hides the settings when closed', async () => {
  await openSettings()
  await userEvent.click(screen.getByRole('button', { name: /Close/ }))
  await screen.findByRole('button', { name: /Settings/, expanded: false })
})
