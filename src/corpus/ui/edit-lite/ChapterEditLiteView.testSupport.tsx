import React, { useMemo } from 'react'
import {
  render,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter } from 'react-router-dom'
import MemorySession, { Session } from 'auth/Session'
import SessionContext from 'auth/SessionContext'
import { createChapterEditSource } from 'corpus/application/edit-lite/createChapterEditSource'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  createFakeChapterEditSource,
  FakeChapterEditSource,
  FakeChapterEditSourceOptions,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  editLiteChapterId,
  editLiteTextDto,
} from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import EditLiteFakeApi, {
  editLiteProvenanceDtos,
} from 'corpus/ui/edit-lite/EditLiteFakeApi.testSupport'
import EditLiteFakeChapter from 'corpus/ui/edit-lite/EditLiteFakeChapter.testSupport'
import EditLiteFakeDictionary from 'corpus/ui/edit-lite/EditLiteFakeDictionary.testSupport'
import { loadedEditor } from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { Switch } from 'router/compat'
import CorpusRoutes from 'router/corpusRoutes'
import { getServices } from 'test-support/AppDriver'
import { createTextUrl, Dto } from 'test-support/FakeApiExpectation'
import LocationDisplay from 'test-support/LocationDisplay'
import { manuscriptDtoFactory } from 'test-support/manuscript-fixtures'
import { ChapterId } from 'transliteration/domain/chapter-id'

export interface EditLiteRouteOptions {
  readonly path?: string
  readonly search?: string
  readonly session?: Session
  readonly fakeApi?: EditLiteFakeApi
  readonly links?: readonly string[]
  readonly showLocation?: boolean
}

export interface ServedEditLiteRoute {
  readonly chapter: EditLiteFakeChapter
  readonly fakeApi: EditLiteFakeApi
}

export { editLiteChapterId } from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'

export const chapterEditPath = '/corpus/L/1/2/SB/I/edit'
export const secondChapterEditPath = '/corpus/L/1/2/SB/II/edit'
export const editLiteRedirectPath = '/corpus/L/1/2/SB/I/edit-lite'
export const editLiteHeading = 'Edit Poem of Creation Standard Babylonian I'

export const secondEditLiteChapterId: ChapterId = {
  ...editLiteChapterId,
  name: 'II',
}

export const editLiteManuscriptDtos: readonly Dto[] = [
  manuscriptDtoFactory.build({
    id: 1,
    siglumDisambiguator: '1a',
    oldSigla: [],
    museumNumber: 'K.5419.C',
    accession: '',
    periodModifier: 'None',
    period: 'Neo-Assyrian',
    provenance: 'Nineveh',
    type: 'Library',
    notes: '',
    references: [],
  }),
]

export const writerSession: Session = new MemorySession([
  'read:texts',
  'write:texts',
])

export const createSourceMock = createChapterEditSource as jest.MockedFunction<
  typeof createChapterEditSource
>

export function createEditLiteFakeApi(): EditLiteFakeApi {
  const fakeApi = new EditLiteFakeApi()
  fakeApi
    .allowChapterManuscripts(editLiteChapterId, editLiteManuscriptDtos)
    .allowProvenances(editLiteProvenanceDtos)
    .expectText(editLiteTextDto)
  return fakeApi
}

export function mockEditSource(
  options: FakeChapterEditSourceOptions = {},
): FakeChapterEditSource {
  const lines: readonly Line[] = options.lines ?? buildEditLiteLines()
  const source = createFakeChapterEditSource({ ...options, lines })
  createSourceMock.mockResolvedValue({
    source,
    outline: buildEditLiteOutline(lines),
  })
  return source
}

export function countRequests(fakeApi: EditLiteFakeApi, path: string): number {
  return fakeApi.client.fetchJson.mock.calls.filter(
    ([requestedPath]) => requestedPath === path,
  ).length
}

export function countTextRequests(fakeApi: EditLiteFakeApi): number {
  return countRequests(fakeApi, createTextUrl(editLiteChapterId.textId))
}

function EditLiteRoute({
  path = chapterEditPath,
  search = '',
  session = writerSession,
  fakeApi,
  links = [],
  showLocation = false,
}: EditLiteRouteOptions & { readonly fakeApi: EditLiteFakeApi }): JSX.Element {
  const routes = useMemo(
    () => CorpusRoutes({ ...getServices(fakeApi.client), sitemap: false }),
    [fakeApi],
  )
  return (
    <MemoryRouter initialEntries={[`${path}${search}`]}>
      <SessionContext.Provider value={session}>
        {links.map((link) => (
          <Link key={link} to={link}>
            {link}
          </Link>
        ))}
        {showLocation && <LocationDisplay />}
        <Switch>{routes}</Switch>
      </SessionContext.Provider>
    </MemoryRouter>
  )
}

export function renderEditLiteRoute(
  options: EditLiteRouteOptions = {},
): RenderResult & { changeSession(session: Session): void } {
  const fakeApi = options.fakeApi ?? createEditLiteFakeApi()
  const view = render(<EditLiteRoute {...options} fakeApi={fakeApi} />)
  return {
    ...view,
    changeSession: (session: Session): void =>
      view.rerender(
        <EditLiteRoute {...options} fakeApi={fakeApi} session={session} />,
      ),
  }
}

export async function waitForLoadedLines(): Promise<void> {
  await waitFor(() =>
    expect(screen.queryByText('Loading line...')).not.toBeInTheDocument(),
  )
}

export async function waitForLoadedEditLite(): Promise<void> {
  await screen.findByRole('heading', { name: editLiteHeading })
  await waitForLoadedLines()
}

export async function renderLoadedEditLiteRoute(
  options: EditLiteRouteOptions = {},
): Promise<ReturnType<typeof renderEditLiteRoute>> {
  const view = renderEditLiteRoute(options)
  await waitForLoadedEditLite()
  return view
}

export async function openServedEditLiteRoute(
  lines: readonly Line[],
  search: string,
  dictionary: EditLiteFakeDictionary = new EditLiteFakeDictionary([]),
  session: Session = writerSession,
): Promise<ServedEditLiteRoute> {
  const chapter = new EditLiteFakeChapter(buildEditLiteOutline(lines), lines)
  const fakeApi = createEditLiteFakeApi()
    .serveChapter(chapter)
    .serveDictionary(dictionary)
  await renderLoadedEditLiteRoute({ fakeApi, search, session })
  return { chapter, fakeApi }
}

export async function editFirstLine(): Promise<void> {
  const editor = await loadedEditor('1')
  await userEvent.type(within(editor).getByLabelText('Number'), 'a')
}

export function pageTabNames(): (string | null)[] {
  return within(screen.getAllByRole('tablist')[0])
    .getAllByRole('tab')
    .map((item) => item.textContent)
}

export function tab(name: string): HTMLElement {
  return screen.getByRole('tab', { name })
}

export function tabPanel(name: string): HTMLElement {
  return screen.getByRole('tabpanel', { name })
}

export async function openTab(name: string): Promise<void> {
  await userEvent.click(tab(name))
  expect(tab(name)).toHaveAttribute('aria-selected', 'true')
  expect(tabPanel(name)).toHaveClass('active')
}

export async function openManuscriptsTab(): Promise<HTMLElement> {
  await openTab('Manuscripts')
  return screen.findByRole('list', { name: 'Manuscripts' })
}

export function leavePage(): string {
  const event = new Event('beforeunload', { cancelable: true })
  Object.defineProperty(event, 'returnValue', { value: '', writable: true })
  window.dispatchEvent(event)
  return String((event as BeforeUnloadEvent).returnValue)
}
