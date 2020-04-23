import React from 'react'
import {
  fireEvent,
  render,
  RenderResult,
  act,
  Matcher,
  within
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import _ from 'lodash'
import App from 'App'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import ApiImageRepository from 'fragmentarium/infrastructure/ImageRepository'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/TextService'
import MemorySession, { Session, guestSession } from 'auth/Session'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import BibliographyService from 'bibliography/application/BibliographyService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { Promise } from 'bluebird'
import { submitForm } from 'test-helpers/utils'
import { eblNameProperty, AuthenticationContext } from 'auth/Auth'

function createApp(api): JSX.Element {
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
    this.session = new MemorySession([
      'write:texts',
      'read:fragments',
      'annotate:fragments',
      'read:words'
    ])
    return this
  }

  async render(): Promise<AppDriver> {
    await act(async () => {
      this.element = render(
        <MemoryRouter initialEntries={this.initialEntries}>
          <AuthenticationContext.Provider
            value={{
              login: _.noop,
              logout: _.noop,
              getSession: (): Session => this.session ?? guestSession,
              isAuthenticated: (): boolean => this.session !== null,
              getAccessToken(): Promise<string> {
                throw new Error('Not implemented')
              },
              getUser(): { [eblNameProperty]: string } {
                return { [eblNameProperty]: 'Test' }
              }
            }}
          >
            {createApp(this.api)}
          </AuthenticationContext.Provider>
        </MemoryRouter>
      )
    })

    return this
  }

  async waitForText(text: Matcher): Promise<void> {
    await this.getElement().findByText(text)
  }

  expectTextContent(text: string | RegExp): void {
    expect(this.getElement().container).toHaveTextContent(text)
  }

  expectNotInContent(text: Matcher): void {
    expect(this.getElement().queryByText(text)).toBeNull()
  }

  expectLink(text: Matcher, expectedHref: string): void {
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

  expectInputElement(label: Matcher, expectedValue: unknown): void {
    expect(
      (this.getElement().getByLabelText(label) as HTMLInputElement).value
    ).toEqual(String(expectedValue))
  }

  changeValueByLabel(label: Matcher, newValue): void {
    const input = this.getElement().getByLabelText(label)
    act(() => {
      fireEvent.change(input, { target: { value: newValue } })
    })
  }

  async submitForm(): Promise<void> {
    await submitForm(this.getElement())
  }

  async click(text: Matcher, n = 0): Promise<void> {
    const clickable = this.getElement().getAllByText(text)[n]
    await act(async () => {
      fireEvent.click(clickable)
    })
  }
}
