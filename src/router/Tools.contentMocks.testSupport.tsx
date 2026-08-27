import React from 'react'

export type ToolsContentMockName =
  | 'signs'
  | 'dictionary'
  | 'references'
  | 'afoRegister'
  | 'realia'
  | 'dossiers'
  | 'genres'
  | 'dateConverter'
  | 'kings'
  | 'cuneiformConverter'
  | 'map'

interface ToolsContentMock {
  modulePath: string
  mockModule: unknown
}

function createMockPage(text: string): () => JSX.Element {
  return function MockPage(): JSX.Element {
    return <div>{text}</div>
  }
}

function createMockPageModule(
  modulePath: string,
  text: string,
): ToolsContentMock {
  return {
    modulePath,
    mockModule: { __esModule: true, default: createMockPage(text) },
  }
}

const TOOLS_CONTENT_MOCKS: Record<ToolsContentMockName, ToolsContentMock> = {
  signs: createMockPageModule('signs/ui/search/Signs', 'Signs Mock'),
  dictionary: createMockPageModule(
    'dictionary/ui/search/Dictionary',
    'Dictionary Mock',
  ),
  references: createMockPageModule(
    'bibliography/ui/BibliographyReferencesContent',
    'Bibliography References Mock',
  ),
  afoRegister: createMockPageModule(
    'afo-register/ui/AfoRegisterSearchPage',
    'AfO-Register Mock',
  ),
  realia: createMockPageModule('realia/ui/RealiaSearchPage', 'Realia Mock'),
  dossiers: createMockPageModule(
    'dossiers/ui/DossiersSearchPage',
    'Dossiers Mock',
  ),
  genres: createMockPageModule('fragmentarium/ui/GenresPage', 'Genres Mock'),
  dateConverter: {
    modulePath: 'chronology/ui/DateConverter/DateConverterForm',
    mockModule: {
      __esModule: true,
      default: createMockPage('Date Converter Form Mock'),
      AboutDateConverter: createMockPage('About Date Converter Mock'),
    },
  },
  kings: createMockPageModule(
    'chronology/ui/Kings/BrinkmanKingsTable',
    'Kings Mock',
  ),
  cuneiformConverter: createMockPageModule(
    'signs/ui/CuneiformConverter/CuneiformConverterForm',
    'Cuneiform Converter Mock',
  ),
  map: createMockPageModule('map/ui/MapTab', 'Map Mock'),
}

export function toolsContentMock(name: ToolsContentMockName): unknown {
  return TOOLS_CONTENT_MOCKS[name].mockModule
}

export function expectToolsContentPagesMocked(): void {
  Object.values(TOOLS_CONTENT_MOCKS).forEach(({ modulePath, mockModule }) => {
    expect(jest.requireMock(modulePath)).toBe(mockModule)
  })
}
