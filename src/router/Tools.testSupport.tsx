import React from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ToolsContentMockName } from 'router/Tools.contentMocks.testSupport'
import type MarkupService from 'markup/application/MarkupService'
import type SignService from 'signs/application/SignService'
import type WordService from 'dictionary/application/WordService'
import type BibliographyService from 'bibliography/application/BibliographyService'
import type AfoRegisterService from 'afo-register/application/AfoRegisterService'
import type RealiaService from 'realia/application/RealiaService'
import type FragmentService from 'fragmentarium/application/FragmentService'
import type DossiersService from 'dossiers/application/DossiersService'
import SessionContext from 'auth/SessionContext'
import MemorySession, { Session } from 'auth/Session'
import Tools from 'router/Tools'

function mockToolsContent(name: ToolsContentMockName): unknown {
  return jest
    .requireActual('router/Tools.contentMocks.testSupport')
    .toolsContentMock(name)
}

jest.mock('router/compat', () => ({
  ...jest.requireActual('router/compat'),
  useHistory: () => ({ push: jest.fn() }),
}))

jest.mock('signs/ui/search/Signs', () => mockToolsContent('signs'))
jest.mock('dictionary/ui/search/Dictionary', () =>
  mockToolsContent('dictionary'),
)
jest.mock('bibliography/ui/BibliographyReferencesContent', () =>
  mockToolsContent('references'),
)
jest.mock('afo-register/ui/AfoRegisterSearchPage', () =>
  mockToolsContent('afoRegister'),
)
jest.mock('realia/ui/RealiaSearchPage', () => mockToolsContent('realia'))
jest.mock('dossiers/ui/DossiersSearchPage', () => mockToolsContent('dossiers'))
jest.mock('fragmentarium/ui/GenresPage', () => mockToolsContent('genres'))
jest.mock('chronology/ui/DateConverter/DateConverterForm', () =>
  mockToolsContent('dateConverter'),
)
jest.mock('chronology/ui/Kings/BrinkmanKingsTable', () =>
  mockToolsContent('kings'),
)
jest.mock('signs/ui/CuneiformConverter/CuneiformConverterForm', () =>
  mockToolsContent('cuneiformConverter'),
)
jest.mock('map/MapTab', () => mockToolsContent('map'))

type ToolsProps = Parameters<typeof Tools>[0]
export type ToolsActiveTab = ToolsProps['activeTab']

export function toolsServiceProps(): Omit<ToolsProps, 'activeTab'> {
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
  activeTab?: ToolsActiveTab,
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

export function rerenderTools(
  rerender: RenderResult['rerender'],
  activeTab: ToolsActiveTab,
): void {
  rerender(<Tools {...toolsServiceProps()} activeTab={activeTab} />)
}
