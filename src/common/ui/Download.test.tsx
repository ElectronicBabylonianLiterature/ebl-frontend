import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dropdown } from 'react-bootstrap'
import Download from 'common/ui/Download'

function renderDownload(includeUrls = true): void {
  render(
    <Download
      baseFileName="BM.123"
      wordDownloadButton={
        <Dropdown.Item key="word" href="/word">
          Download Word
        </Dropdown.Item>
      }
      pdfDownloadButton={
        <Dropdown.Item key="pdf" href="/pdf">
          Download PDF
        </Dropdown.Item>
      }
      atfUrl={includeUrls ? '/atf' : undefined}
      jsonUrl={includeUrls ? '/json' : undefined}
      teiUrl={includeUrls ? '/tei' : undefined}
    />,
  )
}

test('names the actual download button and supports keyboard opening and dismissal', async () => {
  const user = userEvent.setup()
  renderDownload()
  const toggle = screen.getByRole('button', { name: 'Download' })

  await user.tab()
  expect(toggle).toHaveFocus()
  await user.keyboard('{Enter}')

  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await user.tab()
  expect(screen.getByRole('link', { name: 'Download Word' })).toHaveFocus()
  await user.keyboard('{ArrowDown}')
  expect(screen.getByRole('link', { name: 'Download PDF' })).toHaveFocus()
  await user.keyboard('{Escape}')
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(toggle).toHaveFocus()
})

test.each([
  ['Download as ATF', '/atf', 'atf'],
  ['Download as JSON File', '/json', 'json'],
  ['Download as TEI XML File', '/tei', 'xml'],
])(
  'retains the %s download destination and file name',
  async (name, href, extension) => {
    const user = userEvent.setup()
    renderDownload()

    await user.click(screen.getByRole('button', { name: 'Download' }))

    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    expect(screen.getByRole('link', { name })).toHaveAttribute(
      'download',
      `BM.123.${extension}`,
    )
  },
)

test('omits formats without a download URL', async () => {
  const user = userEvent.setup()
  renderDownload(false)

  await user.click(screen.getByRole('button', { name: 'Download' }))

  expect(screen.getByRole('link', { name: 'Download Word' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Download PDF' })).toBeVisible()
  expect(screen.queryByText('Download as ATF')).not.toBeInTheDocument()
  expect(screen.queryByText('Download as JSON File')).not.toBeInTheDocument()
  expect(screen.queryByText('Download as TEI XML File')).not.toBeInTheDocument()
})
