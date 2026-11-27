import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import FosseyDisplay, {
  fosseySummary,
  groupFossey,
} from 'signs/ui/display/SignFossey'
import { Fossey } from 'signs/domain/Sign'

const image = 'iVBORw0KGgo='

function fossey(number: number, overrides: Partial<Fossey> = {}): Fossey {
  return {
    page: 778,
    number,
    reference: '',
    newEdition: '',
    secondaryLiterature: '',
    cdliNumber: '',
    museumNumber: null,
    externalProject: '',
    notes: '',
    date: '',
    transliteration: '',
    sign: '',
    ...overrides,
  }
}

function renderFossey(fosseys: readonly Fossey[]): void {
  render(
    <MemoryRouter>
      <FosseyDisplay fosseys={fosseys} />
    </MemoryRouter>,
  )
}

test('groupFossey keeps images and merges the other numbers into ranges', () => {
  const withImage = fossey(5, { sign: image })
  expect(
    groupFossey([fossey(3), withImage, fossey(1), fossey(2), fossey(7)]),
  ).toEqual({
    withImages: [withImage],
    ranges: [
      { first: 1, last: 3 },
      { first: 7, last: 7 },
    ],
  })
})

test.each([
  [111, 0, '111 numbers · no sign images available'],
  [35, 35, '35 forms, all with sign images'],
  [
    10,
    4,
    '10 numbers · 4 with sign images; the others are grouped into ranges below',
  ],
])('fosseySummary(%i, %i)', (total, withImages, expected) => {
  expect(fosseySummary(total, withImages)).toEqual(expected)
})

test('shows numbers without images as ranges', () => {
  renderFossey([fossey(24351), fossey(24352), fossey(24400)])
  expect(screen.getByText('24351 – 24352')).toBeInTheDocument()
  expect(screen.getByText('24400')).toBeInTheDocument()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})

test('shows a card with the details of a form with an image', () => {
  renderFossey([
    fossey(25721, {
      sign: image,
      reference: 'Dungi: CT, III, 8, XIII, 33.',
      museumNumber: { prefix: 'BM', number: '18343', suffix: '' },
      date: 'Šulgi, 2093-2046 BCE',
    }),
  ])
  expect(screen.getByRole('img', { name: 'Fossey 25721' })).toHaveAttribute(
    'src',
    `data:image/png;base64, ${image}`,
  )
  expect(screen.getByText('p. 778')).toBeInTheDocument()
  expect(screen.getByText('Dungi: CT, III, 8, XIII, 33.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'BM.18343' })).toHaveAttribute(
    'href',
    '/library/BM.18343',
  )
  expect(screen.getByText('(Šulgi, 2093-2046 BCE)')).toBeInTheDocument()
})

describe('with more than three rows of cards', () => {
  const offsetTop = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetTop',
  )

  beforeEach(() => {
    // jsdom has no layout: pretend the cards are laid out two per row.
    Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
      configurable: true,
      get(this: HTMLElement) {
        /* eslint-disable testing-library/no-node-access */
        const siblings = this.parentElement
          ? Array.from(this.parentElement.children)
          : []
        /* eslint-enable testing-library/no-node-access */
        return Math.floor(siblings.indexOf(this) / 2) * 100
      },
    })
  })

  afterEach(() => {
    if (offsetTop) {
      Object.defineProperty(HTMLElement.prototype, 'offsetTop', offsetTop)
    }
  })

  test('shows three rows and a Show more button', async () => {
    renderFossey(
      Array.from({ length: 9 }, (_, index) =>
        fossey(100 + index, { sign: image }),
      ),
    )
    expect(screen.getAllByRole('img')).toHaveLength(6)

    await userEvent.click(
      screen.getByRole('button', { name: 'Show more (3 more)' }),
    )

    expect(screen.getAllByRole('img')).toHaveLength(9)
    await userEvent.click(screen.getByRole('button', { name: 'Show less' }))
    expect(screen.getAllByRole('img')).toHaveLength(6)
  })

  test('has no button when everything fits', () => {
    renderFossey(
      Array.from({ length: 6 }, (_, index) =>
        fossey(100 + index, { sign: image }),
      ),
    )
    expect(screen.getAllByRole('img')).toHaveLength(6)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
