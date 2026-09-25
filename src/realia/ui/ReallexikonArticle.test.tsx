import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReallexikonArticle } from 'realia/ui/ReallexikonArticle'
import { ReallexikonEntry } from 'realia/domain/RealiaEntry'
import {
  RlaPageFormat,
  RlaPageInfo,
  loadRlaPageIndex,
} from 'realia/infrastructure/rlaPageIndex'

jest.mock('realia/infrastructure/rlaPageIndex', () => ({
  loadRlaPageIndex: jest.fn(),
  rlaPageUrl: (volume: string, scan: number, format: string): string =>
    `${format}:${volume}:${scan}`,
}))

const loadMock = loadRlaPageIndex as jest.MockedFunction<
  typeof loadRlaPageIndex
>

const entry: ReallexikonEntry = {
  id: '6603',
  title: 'Königsinschriften',
  reference: null,
}

function indexWith(
  info: Omit<RlaPageInfo, 'format'>,
  format: RlaPageFormat = 'jpg',
): Map<string, RlaPageInfo> {
  return new Map([['6603', { ...info, format }]])
}

function renderArticle(): void {
  render(<ReallexikonArticle entry={entry} />)
}

function open(): void {
  renderArticle()
  fireEvent.click(screen.getByRole('button', { name: 'Show RlA page' }))
}

beforeEach(() => jest.clearAllMocks())

it('loads the first page image on demand and captions a multi-page article', async () => {
  loadMock.mockResolvedValue(
    indexWith({ volume: '6', startScan: 92, endScan: 97, pageLabel: '59' }),
  )
  renderArticle()
  expect(loadMock).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Show RlA page' }))
  const image = await screen.findByRole('img')
  expect(image).toHaveAttribute('src', 'jpg:6:92')
  expect(image).toHaveAttribute('alt', 'Königsinschriften, page 1 of 6')
  expect(screen.getByText('Seite 59 ff. — 1 / 6')).toBeInTheDocument()
})

it('pages within the article and disables the ends', async () => {
  loadMock.mockResolvedValue(
    indexWith({ volume: '6', startScan: 92, endScan: 94, pageLabel: '59' }),
  )
  open()
  await screen.findByRole('img')
  expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
  expect(screen.getByRole('img')).toHaveAttribute('src', 'jpg:6:93')
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
  expect(screen.getByRole('img')).toHaveAttribute('src', 'jpg:6:94')
  expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
  expect(screen.getByRole('img')).toHaveAttribute('src', 'jpg:6:93')
})

it('captions a single-page article without a range', async () => {
  loadMock.mockResolvedValue(
    indexWith({ volume: '6', startScan: 92, endScan: 92, pageLabel: '59' }),
  )
  open()
  await screen.findByRole('img')
  expect(screen.getByText('Seite 59')).toBeInTheDocument()
})

it('falls back to the volume label when no page label is known', async () => {
  loadMock.mockResolvedValue(
    indexWith({ volume: '6', startScan: 92, endScan: 92, pageLabel: '' }),
  )
  open()
  await screen.findByRole('img')
  expect(screen.getByText('Volume 6')).toBeInTheDocument()
})

it('collapses the page and reopens it without refetching the index', async () => {
  loadMock.mockResolvedValue(
    indexWith({ volume: '6', startScan: 92, endScan: 92, pageLabel: '59' }),
  )
  open()
  await screen.findByRole('img')
  fireEvent.click(screen.getByRole('button', { name: 'Hide' }))
  const reopen = screen.getByRole('button', { name: 'Show RlA page' })
  expect(reopen).toBeInTheDocument()
  fireEvent.click(reopen)
  expect(screen.getByRole('img')).toBeInTheDocument()
  expect(loadMock).toHaveBeenCalledTimes(1)
})

it('reports an unavailable page image and drops the pointless toggle', async () => {
  loadMock.mockResolvedValue(new Map())
  open()
  expect(
    await screen.findByText(/No RlA page image is available/),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Show RlA page' }),
  ).not.toBeInTheDocument()
})

it('reports a load failure and keeps the toggle so the user can retry', async () => {
  loadMock.mockRejectedValue(new Error('network'))
  open()
  expect(await screen.findByText(/could not be loaded/)).toBeInTheDocument()
  loadMock.mockResolvedValue(
    indexWith({ volume: '6', startScan: 92, endScan: 92, pageLabel: '59' }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Show RlA page' }))
  expect(await screen.findByRole('img')).toBeInTheDocument()
})

it('embeds a pdf page document with a fallback link to the pdf', async () => {
  loadMock.mockResolvedValue(
    indexWith(
      { volume: '15', startScan: 354, endScan: 355, pageLabel: '354' },
      'pdf',
    ),
  )
  open()
  const document = await screen.findByTitle('Königsinschriften, page 1 of 2')
  expect(document).toHaveAttribute('type', 'application/pdf')
  expect(document).toHaveAttribute(
    'data',
    'pdf:15:354#navpanes=0&statusbar=0&toolbar=0&view=FitH',
  )
  expect(
    screen.getByRole('link', {
      name: 'Open Königsinschriften, page 1 of 2 (PDF)',
    }),
  ).toHaveAttribute('href', 'pdf:15:354')
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})

it('pages through pdf page documents', async () => {
  loadMock.mockResolvedValue(
    indexWith(
      { volume: '15', startScan: 354, endScan: 355, pageLabel: '354' },
      'pdf',
    ),
  )
  open()
  await screen.findByTitle('Königsinschriften, page 1 of 2')
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
  expect(screen.getByTitle('Königsinschriften, page 2 of 2')).toHaveAttribute(
    'data',
    'pdf:15:355#navpanes=0&statusbar=0&toolbar=0&view=FitH',
  )
  expect(screen.getByText('Seite 354 ff. — 2 / 2')).toBeInTheDocument()
})
