import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Score from 'corpus/ui/Score'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { LineGroup } from 'transliteration/ui/LineGroup'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import { lineDisplayFactory } from 'test-support/chapter-fixtures'
import {
  highlightIndexSetterMock,
  lineInfo,
  textServiceMock,
} from 'test-support/line-group-fixtures'
import note from 'test-support/lines/note'
import { TextLine } from 'transliteration/domain/text-line'
import { textLineDto } from 'test-support/lines/text-line'
import {
  namedSign,
  tokenWithClass,
  word,
} from 'test-support/fragment-query-preview'

const manuscript = manuscriptLineDisplayFactory
  .empty()
  .build({}, { associations: { paratext: [note] } })
const lineDetailsOf = (
  manuscripts: readonly ManuscriptLineDisplay[],
): LineDetails =>
  new LineDetails(
    [{ ...lineDisplayFactory.build().variants[0], manuscripts }],
    0,
  )
const lineDetails = lineDetailsOf([manuscript])

function renderScore(lineGroup: LineGroup): void {
  render(
    <MemoryRouter>
      <Score lineGroup={lineGroup} />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  textServiceMock.findChapterLine.mockReset()
})

it('shows the notes of a manuscript line', async () => {
  textServiceMock.findChapterLine.mockResolvedValue(lineDetails)
  const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)
  renderScore(lineGroup)

  await userEvent.click(await screen.findByRole('button', { name: 'Notes' }))

  expect(await screen.findByText(/this is a note/)).toBeVisible()
  expect(lineGroup.lineDetails).toBe(lineDetails)
})

it('reuses the line details that are already loaded', async () => {
  const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)
  lineGroup.setLineDetails(lineDetails)
  renderScore(lineGroup)

  expect(await screen.findAllByRole('row')).toHaveLength(1)
  expect(textServiceMock.findChapterLine).not.toHaveBeenCalled()
})

it('highlights the manuscript words aligned to the active word', async () => {
  const alignedManuscript = manuscriptLineDisplayFactory.build(
    {},
    {
      associations: {
        paratext: [],
        line: new TextLine({
          ...textLineDto,
          content: [
            { ...word('kur', [namedSign('Reading', 'kur')]), alignment: 1 },
            { ...word('ra', [namedSign('Reading', 'ra')]), alignment: 2 },
          ],
        }),
      },
    },
  )
  const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)
  lineGroup.setLineDetails(lineDetailsOf([alignedManuscript]))
  lineGroup.setActiveTokenIndex(1)
  renderScore(lineGroup)

  expect(
    await screen.findByText(
      tokenWithClass('Transliteration__Word--highlight', 'kur'),
    ),
  ).toBeInTheDocument()
  expect(
    screen.queryByText(
      tokenWithClass('Transliteration__Word--highlight', 'ra'),
    ),
  ).not.toBeInTheDocument()
})
