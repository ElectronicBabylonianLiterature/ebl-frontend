import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FragmentariumLink from './FragmentariumLink'

const number = 'X.1'

test.each([
  [
    {
      museumNumber: number,
      isInFragmentarium: true,
    },
  ],
  [
    {
      museumNumber: number,
      isInFragmentarium: false,
    },
  ],
  [
    {
      museumNumber: number,
      accession: '',
      isInFragmentarium: true,
    },
  ],
  [
    {
      museumNumber: number,
      accession: '',
      isInFragmentarium: false,
    },
  ],
  [
    {
      museumNumber: '',
      accession: number,
      isInFragmentarium: false,
    },
  ],
])('%o', (item) => {
  render(
    <MemoryRouter>
      <FragmentariumLink item={item} />
    </MemoryRouter>,
  )
  expect(screen.getByText(number)).toBeVisible()
  if (item.isInFragmentarium) {
    expect(screen.getByText(number)).toHaveAttribute(
      'href',
      `/library/${number}`,
    )
  } else {
    expect(screen.getByText(number)).not.toHaveAttribute('href')
  }
})
