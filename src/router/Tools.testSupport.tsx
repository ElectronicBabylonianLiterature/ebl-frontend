import React from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Tools from 'router/Tools'
import MarkupService from 'markup/application/MarkupService'
import SignService from 'signs/application/SignService'
import WordService from 'dictionary/application/WordService'
import BibliographyService from 'bibliography/application/BibliographyService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import RealiaService from 'realia/application/RealiaService'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import SessionContext from 'auth/SessionContext'
import MemorySession, { Session } from 'auth/Session'

export function toolsServiceProps(): Omit<
  Parameters<typeof Tools>[0],
  'activeTab'
> {
  return {
    markupService: {} as MarkupService,
    signService: {} as SignService,
    wordService: {} as WordService,
    bibliographyService: {} as BibliographyService,
    afoRegisterService: {} as AfoRegisterService,
    realiaService: {} as RealiaService,
    dossiersService: {} as DossiersService,
    fragmentService: {} as FragmentService,
  }
}

export function renderTools(
  activeTab?: Parameters<typeof Tools>[0]['activeTab'],
  session: Session = new MemorySession(['read:realia']),
  initialEntry = '/tools',
): RenderResult {
  const props = {
    ...toolsServiceProps(),
    activeTab,
  }

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>
        <SessionContext.Provider value={session}>
          {children}
        </SessionContext.Provider>
      </MemoryRouter>
    )
  }

  return render(<Tools {...props} />, { wrapper: Wrapper })
}
