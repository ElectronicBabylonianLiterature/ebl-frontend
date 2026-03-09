import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Route } from 'router/compat'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'

import WordDisplayLogograms from 'dictionary/ui/display/WordDisplayLogograms'
import SignService from 'signs/application/SignService'
import Bluebird from 'bluebird'
import { sign } from 'signs/domain/Sign.test'

jest.mock('common/MarkdownAndHtmlToHtml', () => ({
  __esModule: true,
  default: ({
    markdownAndHtml,
    container = 'div',
  }: {
    markdownAndHtml: string
    container?: 'div' | 'span'
  }) => {
    const match = markdownAndHtml.match(/^\*(.+)\*\s*(.*)$/)
    const emphasized = match ? match[1] : null
    const rest = match ? match[2] : markdownAndHtml
    const Container = container
    return (
      <Container className="">
        {emphasized ? <em>{emphasized}</em> : null}
        {emphasized && rest ? ` ${rest}` : rest}
      </Container>
    )
  },
}))

jest.mock('signs/application/SignService')
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()

const session = new MemorySession(['read:words'])

let container: HTMLElement

describe('Fetch logograms', () => {
  const setup = async () => {
    signService.search.mockReturnValue(Bluebird.resolve([sign]))
    renderWordDisplayLogograms()
    await screen.findByText('some notes')
    expect(signService.search).toBeCalledWith({
      wordId: sign.logograms[0].wordId[0],
    })
  }
  it('correctly displays unicode', async () => {
    await setup()
    await screen.findAllByText(new RegExp(sign.logograms[0].unicode))
    expect(container).toMatchSnapshot()
  })
})

function renderWordDisplayLogograms() {
  container = render(
    <MemoryRouter initialEntries={['/dictionary/id']}>
      <SessionContext.Provider value={session}>
        <Route
          path="/dictionary/:id"
          render={() => (
            <WordDisplayLogograms
              wordId={sign.logograms[0].wordId[0]}
              signService={signService}
            />
          )}
        />
      </SessionContext.Provider>
    </MemoryRouter>,
  ).container
}
