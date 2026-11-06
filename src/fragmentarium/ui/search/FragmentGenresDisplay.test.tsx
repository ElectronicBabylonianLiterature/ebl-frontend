import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { Genre, Genres } from 'fragmentarium/domain/Genres'
import FragmentGenresDisplay from 'fragmentarium/ui/search/FragmentGenresDisplay'

test('exposes genres as a single semantic list without nested empty lists', () => {
  render(
    <FragmentGenresDisplay
      genres={
        new Genres([
          new Genre(['ARCHIVE', 'Administrative'], false),
          new Genre(['CANONICAL', 'Divination'], true),
        ])
      }
    />,
  )

  const list = screen.getByRole('list')
  expect(list).toHaveClass('list-unstyled')
  const items = within(list).getAllByRole('listitem')
  expect(items.map((item) => item.textContent)).toEqual([
    'ARCHIVE ➝ Administrative',
    'CANONICAL ➝ Divination (?)',
  ])
  expect(screen.getAllByRole('list')).toHaveLength(1)
})

test('an empty genre collection does not invent a list item', () => {
  render(<FragmentGenresDisplay genres={new Genres([])} />)

  expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
})
