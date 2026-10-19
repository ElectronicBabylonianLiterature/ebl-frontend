import React from 'react'
import { render, screen } from '@testing-library/react'
import LemmaActionButton, {
  LemmaActionCallbacks,
} from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import { wordFactory } from 'test-support/word-fixtures'

export const mockCallbacks: jest.Mocked<LemmaActionCallbacks> = {
  onResetCurrent: jest.fn(),
  onMouseEnter: jest.fn(),
  onMouseLeave: jest.fn(),
  onMultiApply: jest.fn(),
  onMultiReset: jest.fn(),
  onCreateProperNoun: jest.fn(),
}

export const dirtyLemmas: LemmaOption[] = [
  new LemmaOption(wordFactory.build({ _id: 'test' })),
]
export const sessionWithScope = new MemorySession(['create:proper_nouns'])
export const sessionWithoutScope = new MemorySession([])

export function renderButton(
  token: EditableToken,
  session: MemorySession = sessionWithScope,
): void {
  render(
    <SessionContext.Provider value={session}>
      <LemmaActionButton token={token} {...mockCallbacks} />
    </SessionContext.Provider>,
  )
}

export function getDropdownToggle(): HTMLElement {
  return screen.getByRole('button', { name: 'Open token actions' })
}
