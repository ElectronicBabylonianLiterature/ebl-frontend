import React from 'react'
import { act, render, screen } from '@testing-library/react'
import TranslationColumn from 'transliteration/ui/TranslationColumn'
import { translatedFragment } from 'test-support/fragment-fixtures'

const simpleTextLineIndex = 0
const extentTextLineIndex = 3

async function renderTranslationColumn(lineIndex: number, language: string) {
  await act(async () => {
    render(
      <table>
        <tbody>
          <tr>
            <TranslationColumn
              lines={translatedFragment.text.lines}
              lineIndex={lineIndex}
              language={language}
            />
          </tr>
        </tbody>
      </table>
    )
  })
}

it('shows the translation of simple lines', async () => {
  await renderTranslationColumn(simpleTextLineIndex, 'en')
  expect(screen.getByText('English translation')).toBeVisible()
})
it('shows the translation of lines with extents', async () => {
  await renderTranslationColumn(extentTextLineIndex, 'en')
  expect(screen.getByText('English translation over two lines')).toBeVisible()
})
