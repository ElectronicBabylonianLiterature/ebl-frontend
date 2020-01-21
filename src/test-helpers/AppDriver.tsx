import React from 'react'
import {
  fireEvent,
  render,
  waitForElement,
  RenderResult,
  act,
  Matcher,
  within
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from 'App'
import Auth from 'auth/Auth'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import ApiImageRepository from 'fragmentarium/infrastructure/ImageRepository'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/TextService'
import Session from 'auth/Session'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import BibliographyService from 'bibliography/application/BibliographyService'
import { ConsoleErrorReporter } from 'ErrorReporterContext'
import createAuth0Config from 'auth/createAuth0Config'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import SessionStore from 'auth/SessionStore'
import { Promise } from 'bluebird'

function createAuth(sessionStore: SessionStore): Auth {
  const auth0Config = createAuth0Config()
  return new Auth(sessionStore, new ConsoleErrorReporter(), auth0Config)
}

function createApp(api, sessionStore: SessionStore): JSX.Element {
  const wordRepository = new WordRepository(api)
  const fragmentRepository = new FragmentRepository(api)
  const imageRepository = new ApiImageRepository(api)
  const bibliographyRepository = new BibliographyRepository(api)
  const wordService = new WordService(wordRepository)
  const bibliographyService = new BibliographyService(bibliographyRepository)
  const fragmentService = new FragmentService(
    fragmentRepository,
    imageRepository,
    wordRepository,
    bibliographyService
  )
  const fragmentSearchService = new FragmentSearchService(fragmentRepository)
  const textService = new TextService(api)

  return (
    <App
      auth={createAuth(sessionStore)}
      wordService={wordService}
      fragmentService={fragmentService}
      fragmentSearchService={fragmentSearchService}
      bibliographyService={bibliographyService}
      textService={textService}
    />
  )
}

export default class AppDriver {
  private readonly api
  private initialEntries: string[] = []
  private element: RenderResult | null = null
  private session: Session | null = null

  constructor(api) {
    this.api = api
  }

  getElement(): RenderResult {
    if (this.element) {
      return this.element
    } else {
      throw new Error('getElement called before render.')
    }
  }

  withPath(path): AppDriver {
    this.initialEntries = [path]
    return this
  }

  withSession(): AppDriver {
    this.session = new Session(
      'accessToken',
      'idToken',
      Number.MAX_SAFE_INTEGER,
      ['write:texts', 'read:fragments', 'annotate:fragments', 'read:words']
    )
    return this
  }

  async render(): Promise<AppDriver> {
    const fakeSessionStore: SessionStore = {
      setSession: session => {
        this.session = session
      },
      clearSession: () => {
        this.session = null
      },
      getSession: () => this.session || new Session('', '', 0, [])
    }

    await act(async () => {
      this.element = render(
        <MemoryRouter initialEntries={this.initialEntries}>
          {createApp(this.api, fakeSessionStore)}
        </MemoryRouter>
      )
    })

    return this
  }

  async waitForText(text): Promise<void> {
    await waitForElement(() => this.getElement().getByText(text))
  }

  expectTextContent(text): void {
    expect(this.getElement().container).toHaveTextContent(text)
  }

  expectNotInContent(text): void {
    expect(this.getElement().queryByText(text)).toBeNull()
  }

  expectLink(text, expectedHref): void {
    expect(this.getElement().getByText(text)).toHaveAttribute(
      'href',
      expectedHref
    )
  }

  expectBreadcrumbs(crumbs: readonly string[]): void {
    this.expectTextContent(crumbs.join(''))
  }

  expectBreadcrumb(crumb: string, link: string): void {
    expect(
      within(this.getElement().getByLabelText('breadcrumb')).getByText(crumb)
    ).toHaveAttribute('href', link)
  }

  expectInputElement(label, expectedValue): void {
    expect(
      (this.getElement().getByLabelText(label) as HTMLInputElement).value
    ).toEqual(String(expectedValue))
  }

  changeValueByLabel(label, newValue): void {
    const input = this.getElement().getByLabelText(label)
    act(() => {
      fireEvent.change(input, { target: { value: newValue } })
    })
  }

  async click(text: Matcher, n = 0): Promise<void> {
    const clickable = this.getElement().getAllByText(text)[n]
    await act(async () => {
      fireEvent.click(clickable)
    })
  }
}
