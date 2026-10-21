import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import MemorySession, { Session } from 'auth/Session'
import SumerianDictionaryService from 'sumerian-dictionary/application/SumerianDictionaryService'
import SumerianDictionarySearchPage from 'sumerian-dictionary/ui/SumerianDictionarySearchPage'
import LocationDisplay from 'test-support/LocationDisplay'

export const sumerianDictionaryService =
  new (SumerianDictionaryService as jest.Mock<
    jest.Mocked<SumerianDictionaryService>
  >)()

export function renderSearchPage(
  initialEntry = '/tools/sumerian-dictionary',
  session: Session = new MemorySession(['read:sumerian-words']),
): RenderResult {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SessionContext.Provider value={session}>
        <SumerianDictionarySearchPage
          sumerianDictionaryService={sumerianDictionaryService}
        />
        <LocationDisplay />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}
