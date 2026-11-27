import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import FosseyDisplay, {
  fosseySummary,
  groupFossey,
} from 'signs/ui/display/SignFossey'
import { Fossey } from 'signs/domain/Sign'
import {
  installMockResizeObserver,
  resizeObservedElements,
  uninstallMockResizeObserver,
} from 'test-support/resizeObserverMock'

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
  [1, 0, '1 number · no sign images available'],
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
    `data:image/png;base64,${image}`,
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
  const realGetComputedStyle = window.getComputedStyle.bind(window)
  let columns = '200px 200px'

  beforeEach(() => {
    columns = '200px 200px'
    jest
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((element: Element) => {
        const style = realGetComputedStyle(element)
        return element.classList.contains('SignPage__fossey-cards')
          ? new Proxy(style, {
              get: (target, key) =>
                key === 'gridTemplateColumns'
                  ? columns
                  : Reflect.get(target, key),
            })
          : style
      })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    uninstallMockResizeObserver()
  })

  const nineCards = (): readonly Fossey[] =>
    Array.from({ length: 9 }, (_, index) =>
      fossey(100 + index, { sign: image }),
    )

  test('shows three rows and a Show more button', async () => {
    renderFossey(nineCards())
    expect(screen.getAllByRole('img')).toHaveLength(6)

    await userEvent.click(
      screen.getByRole('button', { name: 'Show more (3 more)' }),
    )

    expect(screen.getAllByRole('img')).toHaveLength(9)
    await userEvent.click(screen.getByRole('button', { name: 'Show less' }))
    expect(screen.getAllByRole('img')).toHaveLength(6)
  })

  test('has no button when everything fits', () => {
    renderFossey(nineCards().slice(0, 6))
    expect(screen.getAllByRole('img')).toHaveLength(6)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  test('shows more cards again when the grid gets wider', () => {
    installMockResizeObserver()
    columns = '200px'
    renderFossey(nineCards())
    expect(screen.getAllByRole('img')).toHaveLength(3)

    columns = '200px 200px 200px'
    resizeObservedElements()

    expect(screen.getAllByRole('img')).toHaveLength(9)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  test('shows every card when the grid has no columns', () => {
    columns = 'none'
    renderFossey(nineCards())
    expect(screen.getAllByRole('img')).toHaveLength(9)
  })
})
