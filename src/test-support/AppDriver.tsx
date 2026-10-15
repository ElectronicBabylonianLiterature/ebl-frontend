import React from 'react'
import {
  fireEvent,
  render,
  RenderResult,
  Matcher,
  waitFor,
  ByRoleMatcher,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MemorySession, { Session } from 'auth/Session'
import { AuthenticationContext } from 'auth/Auth'
import { JsonApiClient } from 'http/JsonApiClient'
import {
  breadcrumbs,
  createApp,
  driverAuthentication,
  getServices,
} from 'test-support/appDriverHelpers'

export { getServices }

export default class AppDriver {
  readonly breadcrumbs = breadcrumbs
  private readonly waitTimeout = 10000

  private initialEntries: string[] = []
  private view: RenderResult | null = null
  private session: Session | null = null

  constructor(private readonly api: JsonApiClient) {}

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
          value={driverAuthentication(() => this.session)}
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

  async waitForRouteLoadingToDisappear(): Promise<void> {
    await this.waitForTextToDisappear('Route loading...')
  }

  async waitForTextToDisappear(text: Matcher): Promise<void> {
    await waitFor(
      () => {
        this.expectNotInContent(text)
      },
      { timeout: this.waitTimeout },
    )
  }

  expectNotInContent(text: Matcher): void {
    expect(this.getView().queryByText(text)).not.toBeInTheDocument()
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
}
