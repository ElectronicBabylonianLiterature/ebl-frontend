import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  DossierSearchHelp,
  GenreSearchHelp,
  LemmaSearchHelp,
  MuseumSearchHelp,
  ProvenanceSearchHelp,
  ReferenceSearchHelp,
  ScriptSearchHelp,
  SiglumSearchHelp,
  TransliterationSearchHelp,
} from 'fragmentarium/ui/SearchHelp'

it.each([
  [SiglumSearchHelp, 'Search Museum Numbers', /Museum siglum is separated/],
  [ReferenceSearchHelp, 'Search References', /Search for Author and Year/],
  [LemmaSearchHelp, 'Search Lemmas', /Search for fragments containing/],
  [
    TransliterationSearchHelp,
    'Search Transliterations',
    /Sequences of signs are retrieved/,
  ],
  [ScriptSearchHelp, 'Search Script', /^Filter by script \(only/],
  [GenreSearchHelp, 'Search Genre', /^Filter by genre \(only/],
  [ProvenanceSearchHelp, 'Search Provenance', /^Filter by provenance \(only/],
  [MuseumSearchHelp, 'Search Museum', /^Filter by museum \(only/],
  [DossierSearchHelp, 'Search Dossier', /^Filter by dossier \(only/],
])('renders the %p help popover', (Help, title, content) => {
  render(<Help />)
  expect(screen.getByRole('tooltip')).toHaveAttribute('title', title)
  expect(screen.getByRole('tooltip')).toHaveTextContent(content)
})
