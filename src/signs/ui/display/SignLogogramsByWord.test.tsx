import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SignLogogramsByWord from 'signs/ui/display/SignLogogramsByWord'
import WordService from 'dictionary/application/WordService'
import { wordFactory } from 'test-support/word-fixtures'

const wordService = {
  findAll: jest.fn(),
} as unknown as jest.Mocked<WordService>

beforeEach(() => {
  wordService.findAll.mockResolvedValue([])
})

const logogram = (
  text: string,
  wordId: string[],
  schrammLogogramme: string,
): {
  logogram: string
  atf: string
  wordId: string[]
  schrammLogogramme: string
  unicode: string
} => ({ logogram: text, atf: text, wordId, schrammLogogramme, unicode: '' })

test('shows every word a logogram writes and each cross-reference once', async () => {
  render(
    <MemoryRouter>
      <SignLogogramsByWord
        logograms={[
          logogram(
            'ŠE.GUR',
            ['kurru I', "še'u I"],
            'ŠE.GUR; *kurru* (Kor); ZL',
          ),
          logogram(
            '<sup>giš</sup>ŠE.NU',
            ['šunû II'],
            '<sup>giš</sup>ŠE.NU; *šunû* (?) (Keuschbaum); ME 169',
          ),
          logogram('ŠE.NU', ['šunû II'], 'ŠE.NU; *erû* (Baum); ZL'),
          logogram('U₂₀ → ŠE', [], 'U₂₀ → ŠE'),
          logogram('U₂₀ → ŠE', [], 'U₂₀ → ŠE'),
          logogram('NIGU → NIGA', [], 'NIGU → NIGA'),
        ]}
        wordService={wordService}
      />
    </MemoryRouter>,
  )
  expect(
    await screen.findByRole('link', { name: 'kurru I' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('link', { name: "še'u I" })).toBeInTheDocument()
  expect(screen.getByText('giš', { selector: 'sup' })).toBeInTheDocument()
  expect(screen.getByText('(?)', { exact: false })).toHaveTextContent('(?)')
  expect(screen.getByText('erû', { selector: 'em' })).toBeInTheDocument()
  expect(screen.getByText(/Cross-references:/)).toHaveTextContent(
    'Cross-references: U₂₀ → ŠE · NIGU → NIGA',
  )
})

test('shows the guide word and marks unattested words', async () => {
  wordService.findAll.mockResolvedValue([
    wordFactory.build({
      _id: 'kurru I',
      guideWord: 'measure',
      attested: false,
    }),
  ])
  render(
    <MemoryRouter>
      <SignLogogramsByWord
        logograms={[
          logogram('ŠE.GUR', ['kurru I'], 'ŠE.GUR; *kurru* (Kor); ZL'),
        ]}
        wordService={wordService}
      />
    </MemoryRouter>,
  )
  expect(await screen.findByText(', “measure”')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '*kurru I' })).toBeInTheDocument()
  expect(wordService.findAll).toHaveBeenCalledWith(
    ['kurru I'],
    expect.any(AbortSignal),
  )
})

test('keeps text it cannot parse and logograms without a word', async () => {
  render(
    <MemoryRouter>
      <SignLogogramsByWord
        logograms={[
          logogram('GID₂', ['arāku I'], '*GID₂* some notes'),
          logogram('ŠE.ŠE', [], 'ŠE.ŠE; *uṭṭetu* (Gerstenkorn); ZL'),
          logogram('ŠE.ŠE.ŠE', [], ''),
        ]}
        wordService={wordService}
      />
    </MemoryRouter>,
  )
  expect(await screen.findByText(/some notes/)).toBeInTheDocument()
  expect(screen.getByText('Without dictionary word')).toBeInTheDocument()
  expect(screen.getByText('uṭṭetu', { selector: 'em' })).toBeInTheDocument()
  expect(screen.getByText('ŠE.ŠE.ŠE')).toBeInTheDocument()
})

test('does not look up words when no logogram has one', async () => {
  render(
    <MemoryRouter>
      <SignLogogramsByWord
        logograms={[logogram('U₂₀ → ŠE', [], 'U₂₀ → ŠE')]}
        wordService={wordService}
      />
    </MemoryRouter>,
  )
  expect(await screen.findByText(/Cross-references:/)).toBeInTheDocument()
  expect(wordService.findAll).not.toHaveBeenCalled()
})
