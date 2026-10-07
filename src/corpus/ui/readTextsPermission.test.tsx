import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { helmetContext } from 'router/head'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import Corpus from 'corpus/ui/Corpus'
import TextView from 'corpus/ui/TextView'
import TextService from 'corpus/application/TextService'
import FragmentService from 'fragmentarium/application/FragmentService'
import { text } from 'test-support/test-corpus-text'

jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentService')

const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

function renderWithoutReadTexts(element: JSX.Element): void {
  render(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter>
        <SessionContext.Provider value={new MemorySession([])}>
          {element}
        </SessionContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  )
}

it('lists texts without links for a user who cannot read texts', async () => {
  const listed = {
    genre: 'L',
    category: 1,
    index: 1,
    name: 'Listed Text',
    numberOfVerses: 0,
    approximateVerses: false,
  }
  renderWithoutReadTexts(
    <Corpus textService={{ list: jest.fn().mockResolvedValue([listed]) }} />,
  )

  expect(await screen.findByText('1. Listed Text')).toBeVisible()
  expect(
    screen.queryByRole('link', { name: /Listed Text/ }),
  ).not.toBeInTheDocument()
})

it('asks a user who cannot read texts to log in', async () => {
  textService.find.mockResolvedValue(text)
  renderWithoutReadTexts(
    <TextView
      id={text.id}
      textService={textService}
      fragmentService={fragmentService}
    />,
  )

  expect(
    await screen.findByText('Please log in to view the text.'),
  ).toBeVisible()
})
