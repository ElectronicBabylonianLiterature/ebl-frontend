import React from 'react'
import { render, screen } from '@testing-library/react'

import SessionContext from 'auth/SessionContext'
import LemmaActionButton from './LemmaAnnotationButton'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { kurToken } from 'test-support/test-tokens'
import MemorySession from 'auth/Session'

jest.mock('transliteration/ui/DisplayToken', () => {
  return {
    __esModule: true,
    default: ({ token }: { token: { value: string } }) => (
      <span>{token.value}</span>
    ),
  }
})

const callbacks = {
  onResetCurrent: jest.fn(),
  onMouseEnter: jest.fn(),
  onMouseLeave: jest.fn(),
  onMultiApply: jest.fn(),
  onMultiReset: jest.fn(),
  onCreateProperNoun: jest.fn(),
}

it('relies on the split toggle caret instead of rendering a second icon', () => {
  render(
    <SessionContext.Provider value={new MemorySession(['create:proper_nouns'])}>
      <LemmaActionButton
        token={new EditableToken(kurToken, 0, 0, 0, [])}
        {...callbacks}
      />
    </SessionContext.Provider>,
  )

  expect(
    screen.getByRole('button', { name: 'Open token actions' }),
  ).toBeEmptyDOMElement()
})
