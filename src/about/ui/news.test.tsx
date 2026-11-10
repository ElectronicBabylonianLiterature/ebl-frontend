import React from 'react'
import { render, screen } from '@testing-library/react'
import AboutNews from 'about/ui/news'
import { newsletters } from 'about/ui/news'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent } from '@testing-library/react'
import NewsletterTimeline from 'about/ui/NewsletterTimeline'

test('renders AboutNews component with default newsletter', () => {
  render(
    <MemoryRouter>
      <AboutNews />
    </MemoryRouter>,
  )
  expect(
    screen.getByText(new RegExp(`Newsletter #${newsletters[0].number}`)),
  ).toBeInTheDocument()
})

test('renders AboutNews component with complete menu', () => {
  render(
    <MemoryRouter>
      <AboutNews />
    </MemoryRouter>,
  )
  newsletters.forEach((newsletter) => {
    expect(
      screen.getByText(new RegExp(`^#\\s*${newsletter.number}$`)),
    ).toBeInTheDocument()
  })
})

test('updates active newsletter on link click', () => {
  render(
    <MemoryRouter>
      <AboutNews />
    </MemoryRouter>,
  )
  const secondNewsletterLink = screen.getByText(
    new RegExp(`^#\\s*${newsletters[1].number}$`),
  )
  fireEvent.click(secondNewsletterLink)
  expect(
    screen.getByText(new RegExp(`Newsletter #${newsletters[1].number}`)),
  ).toBeInTheDocument()
})

test('does not render level-one headings from newsletter markdown', () => {
  render(
    <MemoryRouter>
      <AboutNews />
    </MemoryRouter>,
  )

  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
})

describe('newsletter dates', () => {
  // Jest proxies process.env per test file, so changing TZ inside a test does
  // not change the zone Date parsing uses. Guard the source format directly:
  // ISO date-only strings parse as UTC midnight in every time zone, whereas
  // 'MM/DD/YYYY' parses as local midnight and shifts by a day once formatted
  // in UTC east of Greenwich.
  test('are declared as ISO date-only strings', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const source: string = fs.readFileSync(
      path.join(__dirname, 'news.tsx'),
      'utf8',
    )
    const literals = Array.from(
      source.matchAll(/new Date\(\s*(['"`])(.*?)\1\s*\)/g),
      (match) => match[2],
    )
    expect(literals).toHaveLength(newsletters.length)
    literals.forEach((literal) =>
      expect(literal).toMatch(/^\d{4}-\d{2}-\d{2}$/),
    )
  })

  test('are UTC midnight and keep their calendar month', () => {
    newsletters.forEach((newsletter) => {
      expect(newsletter.date.getTime() % (24 * 60 * 60 * 1000)).toBe(0)
    })
    const firstOfMonth = newsletters.find(
      (newsletter) => newsletter.number === 7,
    )
    expect(firstOfMonth?.date.toISOString()).toBe('2022-03-01T00:00:00.000Z')

    render(
      <NewsletterTimeline
        newsletters={newsletters}
        activeNewsletter={newsletters[0]}
        onSelectNewsletter={jest.fn()}
      />,
    )
    expect(screen.getByText('Mar 2022')).toBeInTheDocument()
    expect(screen.queryByText('Feb 2022')).not.toBeInTheDocument()
  })
})
