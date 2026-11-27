import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Route } from 'router/compat'
import SessionContext from 'auth/SessionContext'
import SignDisplay from 'signs/ui/display/SignDisplay'
import MemorySession, { Session } from 'auth/Session'
import SignService from 'signs/application/SignService'
import Sign, { Value } from 'signs/domain/Sign'
import WordService from 'dictionary/application/WordService'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import { HelmetProvider } from 'react-helmet-async'
import { helmetContext } from 'router/head'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'

jest.mock('signs/application/SignService')
jest.mock('dictionary/application/WordService')

const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
const reader = new MemorySession(['read:words'])
const fullEditor = new MemorySession(['read:words', 'read:meszl-kap2'])

const kap3 = `579\t**ŠE**\t𒊺\t→ Kap. VII
ASy 212. Lw. še (allg.).
𒊺𒆰 siehe n117.`
const kap2 = `579\t𒊺\t**— ŠE — ŠL 367 — ASy 212**
Fossey p736-739. Rosengarten n440.
𒊺 𒈗\t**— ŠE-LUGAL — ŠL 367,105**`

const sign = new Sign({
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
  fossey: [
    {
      page: 0,
      number: 24351,
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
    },
    {
      page: 0,
      number: 24352,
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
    },
  ],
  mesZl: kap3,
  LaBaSi: '95',
  unicode: [74426],
})

const croppedAnnotation: CroppedAnnotation = {
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

function renderSignDisplay(session: Session = reader) {
  return render(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter
        initialEntries={[`/signs/${encodeURIComponent(sign.name)}`]}
      >
        <SessionContext.Provider value={session}>
          <Route
            path="/signs/:id"
            render={({ match }) => (
              <SignDisplay
                wordService={wordService}
                signService={signService}
                id={decodeURIComponent(match.params.id ?? '')}
              />
            )}
          />
        </SessionContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  installMockIntersectionObserver()
  signService.find.mockResolvedValue(sign)
  signService.search.mockResolvedValue([])
  signService.getCentroidImages.mockResolvedValue([croppedAnnotation])
  signService.findMesZlKap2.mockResolvedValue([{ number: '579', text: kap2 }])
  signService.findMesZlKap2Section.mockResolvedValue(
    'Kapitel II: Übersicht\n**§1**\tIn verschiedenen Fällen',
  )
})

async function renderPage(session: Session = reader): Promise<void> {
  renderSignDisplay(session)
  await screen.findByRole('heading', { level: 1, name: 'ŠE' })
}

it('shows the overview with sign lists, readings and LaBaSi', async () => {
  await renderPage()
  expect(signService.find).toHaveBeenCalledWith('ŠE', expect.any(AbortSignal))
  expect(screen.getByText('MesZL 579 · U+122BA')).toBeInTheDocument()
  expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual([
    'Sign lists',
    'Readings',
    'LaBaSi',
  ])
  expect(
    screen
      .getAllByRole('definition')
      .slice(0, 2)
      .map((definition) => definition.textContent),
  ).toEqual(['ABZ 367MesZL 579', 'niga, še, u₂₀'])
  expect(
    screen.getByRole('link', { name: 'Open LaBaSi entry 95' }),
  ).toBeInTheDocument()
  expect(
    within(screen.getByRole('list', { name: 'Sign forms by period' }))
      .getAllByRole('listitem')
      .map((item) => item.textContent),
  ).toContain('𒊺Neo-Babylonian')
})

it('lists the sections in order in the navigation', async () => {
  await renderPage()
  const navigation = screen.getByRole('navigation', { name: 'On this page' })
  expect(
    within(navigation)
      .getAllByRole('link')
      .map((link) => link.textContent),
  ).toEqual([
    'ŠE 𒊺Cuneiform sign · MesZL 579',
    'Mesopotamisches Zeichenlexikon',
    'Logograms',
    'Palaeography',
    'Composite signs',
    'Fossey',
  ])
})

it('shows Kapitel III without tabs to readers and never asks for Kapitel II', async () => {
  await renderPage()
  expect(await screen.findByText(/Lw\. še \(allg\.\)/)).toBeInTheDocument()
  expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  expect(signService.findMesZlKap2).not.toHaveBeenCalled()
  expect(screen.getByRole('link', { name: 'n117' })).toHaveAttribute(
    'href',
    '/tools/signs?listsName=MZL&listsNumber=117',
  )
  expect(screen.getByText(/Kapitel Ⅲ/)).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: /Download Borger fonts/ }),
  ).toHaveAttribute('href', '/fonts/BorgerAkkadian.ttc')
})

it('lets Full Editors switch to Kapitel II', async () => {
  await renderPage(fullEditor)
  const kap2Tab = await screen.findByRole('tab', {
    name: 'Kap. Ⅱ · Zeichenübersicht',
  })
  expect(
    screen.getByRole('tab', { name: 'Kap. Ⅲ · Lautwerte' }),
  ).toHaveAttribute('aria-selected', 'true')
  expect(signService.findMesZlKap2).toHaveBeenCalledWith(
    'ŠE',
    expect.any(AbortSignal),
  )

  await userEvent.click(kap2Tab)

  expect(await screen.findByText(/Rosengarten n440/)).toBeInTheDocument()
  expect(kap2Tab).toHaveAttribute('aria-selected', 'true')
  expect(
    screen.getByText('Kapitel Ⅱ', { selector: 'strong' }),
  ).toBeInTheDocument()
})

it('shows the Kapitel II entries of all MesZL numbers', async () => {
  signService.findMesZlKap2.mockResolvedValue([
    { number: '579', text: kap2 },
    { number: '580', text: '580\t𒊺\t**— ŠE variant**\nSecond entry.' },
  ])
  await renderPage(fullEditor)
  await userEvent.click(
    await screen.findByRole('tab', { name: 'Kap. Ⅱ · Zeichenübersicht' }),
  )
  expect(await screen.findByText(/Rosengarten n440/)).toBeInTheDocument()
  expect(screen.getByText('Second entry.')).toBeInTheDocument()
})

it('opens the Einleitung of Kapitel II', async () => {
  await renderPage(fullEditor)
  await userEvent.click(
    await screen.findByRole('tab', { name: 'Kap. Ⅱ · Zeichenübersicht' }),
  )
  const toggle = screen.getByRole('button', { name: 'Einleitung' })
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(toggle)
  expect(await screen.findByText(/In verschiedenen Fällen/)).toBeInTheDocument()
  expect(signService.findMesZlKap2Section).toHaveBeenCalledWith(
    'einleitung',
    expect.any(AbortSignal),
  )
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
})

it('shows no tabs to Full Editors when there is no Kapitel II entry', async () => {
  signService.findMesZlKap2.mockResolvedValue([])
  await renderPage(fullEditor)
  expect(await screen.findByText(/Lw\. še \(allg\.\)/)).toBeInTheDocument()
  expect(screen.queryByRole('tab')).not.toBeInTheDocument()
})

it('groups logograms by Akkadian word', async () => {
  await renderPage()
  const section = screen.getByRole('region', { name: 'Logograms' })
  expect(within(section).getByRole('link', { name: "še'u I" })).toHaveAttribute(
    'href',
    `/dictionary/${encodeURIComponent("še'u I")}`,
  )
  expect(section).toHaveTextContent('„Gerste, Getreide“')
  expect(section).toHaveTextContent('Cross-references: U₂₀ → ŠE')
})

it('shows Fossey numbers without images as a range', async () => {
  await renderPage()
  const section = screen.getByRole('region', { name: 'Fossey' })
  expect(section).toHaveTextContent('24351 – 24352')
})

it('shows the palaeography accordion', async () => {
  await renderPage()
  expect(await screen.findByText(/Neo-Assyrian \(/)).toBeInTheDocument()
})

it('asks guests to log in', async () => {
  renderSignDisplay(new MemorySession([]))
  expect(
    await screen.findByText('Please log in to browse the Signs.'),
  ).toBeVisible()
})
