import React from 'react'
import {
  fireEvent,
  render,
  RenderResult,
  Matcher,
  waitFor,
  ByRoleMatcher,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import _ from 'lodash'
import MemorySession, { Session, guestSession } from 'auth/Session'
import { eblNameProperty, AuthenticationContext } from 'auth/Auth'
import Promise from 'bluebird'
import {
  breadcrumbs,
  createApp,
  getServices,
} from 'test-support/appDriverHelpers'

export { getServices }

export default class AppDriver {
  readonly breadcrumbs = breadcrumbs
  private readonly waitTimeout = 10000

  private initialEntries: string[] = []
  private view: RenderResult | null = null
  private session: Session | null = null

  constructor(private readonly api) {}

  getView(): RenderResult {
    if (this.view) {
      return this.view
    } else {
      throw new Error('getElement called before render.')
    }
  }

  withPath(path: string): AppDriver {
    this.initialEntries = [path]
    return this
  }

  withSession(): AppDriver {
    this.session = new MemorySession([
      'read:texts',
      'write:texts',
      'read:fragments',
      'annotate:fragments',
      'read:words',
    ])
    return this
  }

  render(): AppDriver {
    this.view = render(
      <MemoryRouter initialEntries={this.initialEntries}>
        <AuthenticationContext.Provider
          value={{
            login: _.noop,
            logout: async () => {},
            getSession: (): Session => this.session ?? guestSession,
            isAuthenticated: (): boolean => this.session !== null,
            getAccessToken(): Promise<string> {
              throw new Error('Not implemented')
            },
            getUser(): { [eblNameProperty]: string } {
              return { [eblNameProperty]: 'Test' }
            },
          }}
        >
          {createApp(this.api)}
        </AuthenticationContext.Provider>
      </MemoryRouter>,
    )

    return this
  }

  async waitForText(text: Matcher): Promise<void> {
    await this.getView().findAllByText(text, {}, { timeout: this.waitTimeout })
  }

  async waitForRouteLoadingToDisappear(
    options: Parameters<typeof waitFor>[1] = {},
  ): Promise<void> {
    await this.waitForTextToDisappear('Route loading...', options)
  }

  async waitForTextToDisappear(
    text: Matcher,
    options: Parameters<typeof waitFor>[1] = {},
  ): Promise<void> {
    await waitFor(
      () => {
        this.expectNotInContent(text)
      },
      {
        timeout: this.waitTimeout,
        ...options,
      },
    )
  }

  expectTextContent(text: string | RegExp): void {
    expect(this.getView().container).toHaveTextContent(text)
  }

  expectNotInContent(text: Matcher): void {
    expect(this.getView().queryByText(text)).not.toBeInTheDocument()
  }

  expectLink(text: Matcher, expectedHref: string): void {
    expect(this.getView().getByText(text)).toHaveAttribute('href', expectedHref)
  }

  expectInputElement(label: Matcher, expectedValue: unknown): void {
    expect(this.getView().getByLabelText(label)).toHaveValue(
      String(expectedValue),
    )
  }

  expectChecked(label: Matcher): void {
    expect(this.getView().getByLabelText(label)).toBeChecked()
  }

  expectNotChecked(label: Matcher): void {
    expect(this.getView().getByLabelText(label)).not.toBeChecked()
  }

  changeValueByLabel(label: Matcher, newValue: string): void {
    const input = this.getView().getByLabelText(label)
    fireEvent.change(input, { target: { value: newValue } })
  }

  click(text: Matcher, n = 0): void {
    const clickable = this.getView().getAllByText(text)[n]
    fireEvent.click(clickable)
  }

  clickByRole(role: ByRoleMatcher, name: string | RegExp, n = 0): void {
    const clickable = this.getView().getAllByRole(role, { name })[n]
    fireEvent.click(clickable)
  }

  async clickasync(text: Matcher, n = 0): Promise<void> {
    const clickable = this.getView().getAllByText(text)[n]
    await userEvent.click(clickable)
  }

  async clickByRoleasync(
    role: ByRoleMatcher,
    name: string | RegExp,
    n = 0,
  ): Promise<void> {
    const clickable = this.getView().getAllByRole(role, { name })[n]
    await userEvent.click(clickable)
  }
}
