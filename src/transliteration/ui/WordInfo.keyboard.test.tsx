import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LemmaPopover } from 'transliteration/ui/WordInfo'
import { LineLemmasContext } from 'transliteration/ui/LineLemmasContext'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import WordService from 'dictionary/application/WordService'
import { Token } from 'transliteration/domain/token'
import { dictionaryWord, word } from 'test-support/word-info-fixtures'

jest.mock('dictionary/application/WordService')

const dictionary = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

function renderPopover({
  token = word,
  routerLinks = true,
}: {
  token?: Token
  routerLinks?: boolean
} = {}): void {
  render(
    <MemoryRouter>
      <RouterLinkModeContext.Provider value={routerLinks}>
        <DictionaryContext.Provider value={dictionary}>
          <LineLemmasContext.Provider
            value={{
              lemmaMap: new Map([[dictionaryWord._id, dictionaryWord]]),
              lemmaSetter: jest.fn(),
            }}
          >
            <LemmaPopover token={token}>test word</LemmaPopover>
            <button type="button">Another action</button>
          </LineLemmasContext.Provider>
        </DictionaryContext.Provider>
      </RouterLinkModeContext.Provider>
    </MemoryRouter>,
  )
}

test.each(['{Enter}', ' '])(
  'opens with %s and provides keyboard access to dictionary actions',
  async (key) => {
    const user = userEvent.setup()
    renderPopover()
    const trigger = screen.getByRole('button', { name: 'test word' })

    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger).toHaveAttribute('type', 'button')
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).not.toHaveAttribute('aria-controls')

    await user.tab()
    expect(trigger).toHaveFocus()
    await user.keyboard(key)

    const dialog = await screen.findByRole('dialog', { name: 'test word' })
    await waitFor(() => expect(dialog).toHaveFocus())
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', dialog.id)
    const popoverId = dialog.id

    await user.tab()
    expect(
      screen.getByRole('button', { name: 'Close word information' }),
    ).toHaveFocus()
    await user.tab()
    expect(
      screen.getByRole('link', { name: 'Open the word in the Dictionary.' }),
    ).toHaveFocus()

    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).not.toHaveAttribute('aria-controls')

    await user.keyboard(key)
    expect(
      await screen.findByRole('dialog', { name: 'test word' }),
    ).toHaveAttribute('id', popoverId)
  },
)

test('the close control returns focus to the word', async () => {
  const user = userEvent.setup()
  renderPopover()
  const trigger = screen.getByRole('button', { name: 'test word' })

  await user.click(trigger)
  const dialog = await screen.findByRole('dialog')
  await waitFor(() => expect(dialog).toHaveFocus())
  await user.click(
    screen.getByRole('button', { name: 'Close word information' }),
  )

  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  )
  expect(trigger).toHaveFocus()
})

test('outside dismissal preserves focus on the newly selected control', async () => {
  const user = userEvent.setup()
  renderPopover()
  const trigger = screen.getByRole('button', { name: 'test word' })

  await user.click(trigger)
  const dialog = await screen.findByRole('dialog')
  await waitFor(() => expect(dialog).toHaveFocus())
  const otherControl = screen.getByRole('button', { name: 'Another action' })
  await user.click(otherControl)

  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  )
  expect(otherControl).toHaveFocus()
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test.each([
  { token: { ...word, uniqueLemma: [] }, routerLinks: true },
  { token: word, routerLinks: false },
])('does not create an unavailable interaction for %p', (options) => {
  renderPopover(options)

  expect(screen.getByText('test word')).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'test word' }),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
