import React from 'react'
import { render, act, screen } from '@testing-library/react'
import MemorySession from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import SimpleFragmentView from 'fragmentarium/ui/fragment/SimpleFragmentView'
import { createMemoryHistory, MemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import { translatedFragment } from 'test-support/fragment-fixtures'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('auth/Session')

const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentServiceMock = new MockFragmentService()
const session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()
let container: HTMLElement
let history: MemoryHistory

async function renderSimpleFragmentView(history: MemoryHistory) {
  await act(async () => {
    container = render(
      <Router history={history}>
        <SimpleFragmentView
          fragmentService={fragmentServiceMock}
          number={translatedFragment.number}
          session={session}
        />
      </Router>
    ).container
  })
}

beforeEach(async () => {
  session.isAllowedToReadFragments.mockReturnValue(true)
  fragmentServiceMock.find.mockResolvedValue(translatedFragment)
})

it('correctly displays the simple fragment view', async () => {
  history = createMemoryHistory()
  await renderSimpleFragmentView(history)

  expect(container).toMatchSnapshot()
})
describe('language url parameter', () => {
  const renderWithLanguage = async (language: string) => {
    history = createMemoryHistory({
      initialEntries: [`/html?lang=${language}`],
    })
    await renderSimpleFragmentView(history)
  }

  test.each([
    ['en', 'English', 'Arabic'],
    ['ar', 'Arabic', 'English'],
  ])(
    'only shows %s when lang=%s is set',
    async (lang, visibleLang, hiddenLang) => {
      await renderWithLanguage(lang)
      expect(screen.getByText(`${visibleLang} translation`)).toBeVisible()
      expect(
        screen.queryByText(`${hiddenLang} translation`)
      ).not.toBeInTheDocument()
    }
  )

  it('shows all languages when lang is not set', async () => {
    history = createMemoryHistory()
    await renderSimpleFragmentView(history)
    expect(screen.getByText('English translation')).toBeVisible()
    expect(screen.getByText('Arabic translation')).toBeVisible()
  })
})
