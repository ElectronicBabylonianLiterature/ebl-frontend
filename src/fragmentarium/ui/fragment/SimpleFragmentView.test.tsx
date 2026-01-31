import React from 'react'
import { render, act, screen } from '@testing-library/react'
import MemorySession from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import SimpleFragmentView from 'fragmentarium/ui/fragment/SimpleFragmentView'
import { MemoryRouter } from 'react-router-dom'
import { translatedFragment } from 'test-support/fragment-fixtures'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('auth/Session')

const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentServiceMock = new MockFragmentService()
const session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()
let container: HTMLElement

async function renderSimpleFragmentView() {
  await act(async () => {
    container = render(
      <MemoryRouter>
        <SimpleFragmentView
          fragmentService={fragmentServiceMock}
          number={translatedFragment.number}
          session={session}
        />
      </MemoryRouter>,
    ).container
  })
}

beforeEach(async () => {
  session.isAllowedToReadFragments.mockReturnValue(true)
  fragmentServiceMock.find.mockResolvedValue(translatedFragment)
})

it('correctly displays the simple fragment view', async () => {
  await renderSimpleFragmentView()

  expect(container).toMatchSnapshot()
})
describe('language url parameter', () => {
  const renderWithLanguage = async (language: string) => {
    await renderSimpleFragmentView()
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
        screen.queryByText(`${hiddenLang} translation`),
      ).not.toBeInTheDocument()
    },
  )

  it('shows all languages when lang is not set', async () => {
    await renderSimpleFragmentView()
    expect(screen.getByText('English translation')).toBeVisible()
    expect(screen.getByText('Arabic translation')).toBeVisible()
  })
})
