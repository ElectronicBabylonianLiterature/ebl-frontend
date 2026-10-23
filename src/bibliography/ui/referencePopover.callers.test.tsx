import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompactCitation from 'bibliography/ui/CompactCitation'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import Introduction from 'corpus/ui/Introduction'
import LineNumber from 'corpus/ui/LineNumber'
import { createText } from 'corpus/domain/text'
import {
  bibliographyEntryFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import { lineDisplayFactory } from 'test-support/chapter-fixtures'
import { ResearchProjects } from 'research-projects/researchProject'

const reference = referenceFactory.build(
  { pages: '12', linesCited: [] },
  {
    associations: {
      document: bibliographyEntryFactory.build(
        {},
        {
          transient: {
            author: [{ family: '[Editor](https://example.org/editor)' }],
            issued: { 'date-parts': [[2020]] },
          },
        },
      ),
    },
  },
)

test.each([
  [
    'single citation',
    <CompactCitation key="single" references={[reference]} />,
  ],
  [
    'text introduction',
    <Introduction
      key="introduction"
      text={createText({ references: [reference] })}
    />,
  ],
])(
  '%s exposes a keyboard trigger without nested links',
  async (_name, content) => {
    render(content)
    const trigger = screen.getByRole('button', { name: /Editor, 2020/ })
    expect(within(trigger).queryByRole('link')).not.toBeInTheDocument()
    await userEvent.tab()
    expect(trigger).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
  },
)

test('grouped details name an otherwise empty trigger and retain reference notes', async () => {
  const notesOnly = reference
    .setPages('')
    .setLinesCited([])
    .setNotes('Detailed note')
  render(<CompactCitation references={[reference, notesOnly]} />)

  expect(screen.getByRole('button', { name: '12' })).toBeVisible()
  const trigger = screen.getByRole('button', { name: 'Reference' })
  expect(trigger).toBeVisible()
  expect(screen.getByRole('link', { name: 'Editor' })).toHaveAttribute(
    'href',
    'https://example.org/editor',
  )
  await userEvent.click(trigger)
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Detailed note')
})

test('resolved old-line citations can be reached after the line anchor', async () => {
  const line = lineDisplayFactory.build({
    oldLineNumbers: [{ number: '76a', reference }],
  })
  render(
    <table>
      <tbody>
        <tr>
          <LineNumber line={line} activeLine="" showOldLineNumbers />
        </tr>
      </tbody>
    </table>,
  )

  const trigger = screen.getByRole('button', {
    name: reference.authors.join('/'),
  })
  await userEvent.tab()
  expect(screen.getByRole('link')).toHaveFocus()
  await userEvent.tab()
  expect(trigger).toHaveFocus()
  await userEvent.keyboard(' ')
  expect(await screen.findByRole('tooltip')).toBeInTheDocument()
})

test.each(['Q123', ''])('names authorless citations with identity %s', (id) => {
  const authorless = new Reference(
    'EDITION',
    '',
    '',
    [],
    new BibliographyEntry({ id }),
  )
  const line = lineDisplayFactory.build({
    oldLineNumbers: [{ number: '76a', reference: authorless }],
  })
  render(
    <>
      <Introduction
        text={createText({
          references: [authorless, authorless.setPages('3')],
        })}
      />
      <table>
        <tbody>
          <tr>
            <LineNumber line={line} activeLine="" showOldLineNumbers />
          </tr>
        </tbody>
      </table>
    </>,
  )

  expect(
    screen.getAllByRole('button', { name: id || 'Reference' }),
  ).toHaveLength(2)
  for (const button of screen.getAllByRole('button')) {
    expect(button).toHaveAccessibleName()
    expect(button).not.toBeEmptyDOMElement()
  }
})

test('retains introduction and project content when there are no references', () => {
  render(
    <Introduction
      text={createText({
        intro: 'Introduction text',
        projects: [ResearchProjects.CAIC],
      })}
    />,
  )

  expect(screen.getByText('Introduction text')).toBeVisible()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    ResearchProjects.CAIC.url,
  )
})
