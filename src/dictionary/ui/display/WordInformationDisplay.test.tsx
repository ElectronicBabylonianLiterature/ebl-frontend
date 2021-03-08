import React, { ReactNode } from 'react'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { factory } from 'factory-girl'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import WordInformationDisplay from 'dictionary/ui/display/WordInformationDisplay'
import WordService from 'dictionary/application/WordService'
import MemorySession from 'auth/Session'
import Bluebird from 'bluebird'

jest.mock('dictionary/application/WordService')
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

const session = new MemorySession(['read:words'])
let word

describe('Fetch word', () => {
  beforeEach(async () => {
    word = await factory.build('word')
    wordService.find.mockReturnValue(Bluebird.resolve(word))
    await renderWordInformationDisplay()
    expect(wordService.find).toBeCalledWith('id')
  })
  it('Word parts are displayed', async () => {
    word.lemma.map((lemma) => expectToBeVisible(new RegExp(lemma)))
    expectToBeVisible(new RegExp(word.guideWord))
    expectToBeVisible(new RegExp(word.meaning))

    function expectToBeVisible(text: string | RegExp): void {
      screen
        .getAllByText(text)
        .map((gettedText) => expect(gettedText).toBeVisible())
    }
  })
})
async function renderWordInformationDisplay(): Promise<void> {
  render(
    <MemoryRouter initialEntries={['/dictionary/id']}>
      <SessionContext.Provider value={session}>
        <Route
          path="/dictionary/:id"
          render={(props: RouteComponentProps<{ id: string }>): ReactNode => (
            <WordInformationDisplay wordService={wordService} {...props} />
          )}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  await waitForElementToBeRemoved(screen.getByLabelText('Spinner'))
}
