import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SignLogogramsByWord from 'signs/ui/display/SignLogogramsByWord'

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

test('shows every word a logogram writes and each cross-reference once', () => {
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
      />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: 'kurru I' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: "še'u I" })).toBeInTheDocument()
  expect(screen.getByText('giš', { selector: 'sup' })).toBeInTheDocument()
  expect(screen.getByText('(?)', { exact: false })).toHaveTextContent('(?)')
  expect(screen.getByText('erû', { selector: 'em' })).toBeInTheDocument()
  expect(screen.getByText(/Cross-references:/)).toHaveTextContent(
    'Cross-references: U₂₀ → ŠE · NIGU → NIGA',
  )
})
