import React from 'react'
import { render, screen } from '@testing-library/react'
import LemmaActionButton from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'

export const mockCallbacks = {
  onResetCurrent: jest.fn(),
  onMouseEnter: jest.fn(),
  onMouseLeave: jest.fn(),
  onMultiApply: jest.fn(),
  onMultiReset: jest.fn(),
  onCreateProperNoun: jest.fn(),
}

export const dirtyLemmas: LemmaOption[] = [
  { value: 'test', homonym: 'I' } as LemmaOption,
]
export const sessionWithScope = new MemorySession(['create:proper_nouns'])
export const sessionWithoutScope = new MemorySession([])

export const renderButton = (
  token: EditableToken,
  session: MemorySession = sessionWithScope,
): void => {
  render(
    <SessionContext.Provider value={session}>
      <LemmaActionButton token={token} {...mockCallbacks} />
    </SessionContext.Provider>,
  )
}

export const getDropdownToggle = (): HTMLElement =>
  screen
    .getAllByRole('button')
    .find(
      (btn) => btn.getAttribute('id') === 'dropdown-split-basic',
    ) as HTMLElement
