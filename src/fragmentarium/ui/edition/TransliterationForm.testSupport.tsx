import React from 'react'
import { render } from '@testing-library/react'
import TransliterationForm from 'fragmentarium/ui/edition/TransliterationForm'

export const transliteration = 'line1\nline2'
export const notes = 'notes'
export const introduction = 'introduction'

export function renderTransliterationForm(updateEdition: jest.Mock): {
  unmount: () => void
} {
  const { unmount } = render(
    <TransliterationForm
      transliteration={transliteration}
      notes={notes}
      introduction={introduction}
      updateEdition={updateEdition}
    />,
  )
  return { unmount }
}
