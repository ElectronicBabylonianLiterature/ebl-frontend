import React from 'react'
import { render } from '@testing-library/react'
import Chance from 'chance'
import { MemoryRouter } from 'react-router-dom'
import LatestTransliterations from 'fragmentarium/ui/front-page/LatestTransliterations'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import SessionContext from 'auth/SessionContext'
import MemorySession, { Session } from 'auth/Session'
import DossiersService from 'dossiers/application/DossiersService'

export const chance = new Chance('latest-test')

export interface LatestTransliterationsTestContext {
  fragmentService: jest.Mocked<FragmentService>
  wordService: jest.Mocked<WordService>
  dossiersService: jest.Mocked<DossiersService>
  session: Session
  renderLatest: (preview?: boolean) => HTMLElement
}

export function createLatestTransliterationsTestContext(): LatestTransliterationsTestContext {
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  const dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
  const session: Session = new MemorySession(['read:fragments'])

  return {
    fragmentService: fragmentService,
    wordService: wordService,
    dossiersService: dossiersService,
    session: session,
    renderLatest: (preview = false): HTMLElement =>
      render(
        <MemoryRouter>
          <DictionaryContext.Provider value={wordService}>
            <SessionContext.Provider value={session}>
              <LatestTransliterations
                fragmentService={fragmentService}
                dossiersService={dossiersService}
                preview={preview}
              />
            </SessionContext.Provider>
          </DictionaryContext.Provider>
        </MemoryRouter>,
      ).container,
  }
}
