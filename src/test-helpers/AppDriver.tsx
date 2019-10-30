import React from 'react'
import {
  fireEvent,
  render,
  waitForElement,
  RenderResult
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from 'App'
import Auth from 'auth/Auth'
import WordRepository from 'dictionary/WordRepository'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import ApiImageRepository from 'fragmentarium/infrastructure/ImageRepository'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/WordService'
import TextService from 'corpus/TextService'
import Session from 'auth/Session'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import BibliographyService from 'bibliography/application/BibliographyService'
import { ConsoleErrorReporter } from 'ErrorReporterContext'
import createAuth0Config from 'auth/createAuth0Config'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import SessionStore from 'auth/SessionStore'

function createApp(api, sessionStore): JSX.Element {
  const auth0Config = createAuth0Config()
  const auth = new Auth(sessionStore, new ConsoleErrorReporter(), auth0Config)
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
      auth={auth}
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
      ['write:texts']
    )
    return this
  }

  render(): AppDriver {
    const fakeSessionStore: SessionStore = {
      setSession: session => {
        this.session = session
      },
      clearSession: () => {
        this.session = null
      },
      getSession: () => this.session || new Session('', '', 0, [])
    }

    this.element = render(
      <MemoryRouter initialEntries={this.initialEntries}>
        {createApp(this.api, fakeSessionStore)}
      </MemoryRouter>
    )

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

  expectBreadcrumbs(crumbs): void {
    this.expectTextContent(crumbs.join(''))
  }

  expectInputElement(label, expectedValue): void {
    expect(
      (this.getElement().getByLabelText(label) as HTMLInputElement).value
    ).toEqual(String(expectedValue))
  }

  changeValueByLabel(label, newValue): void {
    const input = this.getElement().getByLabelText(label)
    fireEvent.change(input, { target: { value: newValue } })
  }

  click(text, n = 0): void {
    const clickable = this.getElement().getAllByText(text)[n]
    fireEvent.click(clickable)
  }
}
