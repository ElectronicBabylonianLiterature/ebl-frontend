import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Route } from 'router/compat'
import { HelmetProvider } from 'react-helmet-async'
import { helmetContext } from 'router/head'
import SessionContext from 'auth/SessionContext'
import MemorySession, { Session } from 'auth/Session'
import SignService from 'signs/application/SignService'
import Sign, { Fossey, Value } from 'signs/domain/Sign'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import SignDisplay from 'signs/ui/display/SignDisplay'
import LocationDisplay from 'test-support/LocationDisplay'

export const reader = new MemorySession(['read:words'])
export const fullEditor = new MemorySession(['read:words', 'read:meszl-kap2'])

export const kap3 = `579\t**ŠE**\t𒊺\t→ Kap. VII
ASy 212. Lw. še (allg.).
𒊺𒆰 siehe n117.`

export const kap2 = `579\t𒊺\t**— ŠE — Testkopf**
Erfundene Zeile für den Test.
𒊺 𒈗\t**— ŠE-LUGAL — erfunden**`

function fosseyNumber(number: number): Fossey {
  return {
    page: 0,
    number,
    reference: '',
    newEdition: '',
    secondaryLiterature: '',
    cdliNumber: '',
    museumNumber: null,
    externalProject: '',
    notes: '',
    date: '',
    transliteration: '',
    sign: '',
  }
}

export const sign = new Sign({
  name: 'ŠE',
  lists: [
    { name: 'MZL', number: '579' },
    { name: 'ABZ', number: '367' },
  ],
  values: [new Value('še', 1), new Value('niga', 1), new Value('u', 20)],
  logograms: [
    {
      logogram: 'ŠE',
      atf: 'ŠE',
      wordId: ["še'u I"],
      schrammLogogramme: 'ŠE; *û, uʾu* (Gerste, Getreide); ME 169 CD 369a',
      unicode: '𒊺',
    },
    {
      logogram: 'U₂₀ → ŠE',
      atf: 'U₂₀ → ŠE',
      wordId: [],
      schrammLogogramme: 'U₂₀ → ŠE',
      unicode: '',
    },
  ],
  fossey: [fosseyNumber(24351), fosseyNumber(24352)],
  mesZl: kap3,
  LaBaSi: '95',
  unicode: [74426],
})

export const croppedAnnotation: CroppedAnnotation = {
  image: 'test-base64-string',
  fragmentNumber: 'K.1808',
  script: 'NA',
  label: "ii r 4'",
  annotationId: 'annotation-1',
  pcaClustering: {
    clusterId: 'cluster',
    clusterRank: 0,
    form: 'canonical1',
    isCentroid: true,
    clusterSize: 1,
    isMain: true,
  },
}

export function setUpSignService(
  signService: jest.Mocked<SignService>,
  displayedSign: Sign = sign,
): void {
  signService.find.mockResolvedValue(displayedSign)
  signService.search.mockResolvedValue([])
  signService.getCentroidImages.mockResolvedValue([croppedAnnotation])
  signService.findMesZlKap2.mockResolvedValue([{ number: '579', text: kap2 }])
}

export const signPath = `/signs/${encodeURIComponent(sign.name)}`

export function renderSignDisplay(
  signService: SignService,
  session: Session,
  path: string,
): ReturnType<typeof render> {
  return render(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter initialEntries={[path]}>
        <SessionContext.Provider value={session}>
          <Route
            path="/signs/:id"
            render={({ match }) => (
              <SignDisplay
                signService={signService}
                id={decodeURIComponent(String(match.params.id))}
              />
            )}
          />
          <LocationDisplay />
        </SessionContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  )
}

export async function renderSignPage(
  signService: SignService,
  session: Session = reader,
  path: string = signPath,
): Promise<ReturnType<typeof render>> {
  const view = renderSignDisplay(signService, session, path)
  await screen.findByRole('heading', { level: 1, name: 'ŠE' })
  return view
}
