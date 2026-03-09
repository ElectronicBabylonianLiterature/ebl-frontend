import React from 'react'
import { render, screen } from '@testing-library/react'
import _ from 'lodash'
import { MemoryRouter } from 'react-router-dom'
import { createText, Text } from 'corpus/domain/text'
import { ChapterTitle, ChapterTitleLink } from './chapter-title'
import { stageToAbbreviation } from 'common/period'

const stage = 'Old Babylonian'
const name = 'I'
const line = 'First'

test('Shows stage', () => {
  const text = createText({
    chapters: [
      {
        stage: stage,
        name: name,
        title: [{ type: 'StringPart', text: line }],
        uncertainFragments: [],
      },
      {
        stage: 'Neo Babylonia',
        name: 'II',
        title: [{ type: 'StringPart', text: 'Second' }],
        uncertainFragments: [],
      },
    ],
  })
  render(
    <ChapterTitle
      showStage={text.hasMultipleStages}
      chapter={text.chapters[0]}
    />,
  )
  expect(screen.getByText(new RegExp(_.escapeRegExp(stage)))).toBeVisible()
  commonTests(text)
})

test('Does not show stage', () => {
  const text = createText({
    chapters: [
      {
        stage: stage,
        name: name,
        title: [{ type: 'StringPart', text: line }],
        uncertainFragments: [],
      },
      {
        stage: stage,
        name: 'II',
        title: [{ type: 'StringPart', text: 'Second' }],
        uncertainFragments: [],
      },
    ],
  })
  render(
    <ChapterTitle
      showStage={text.hasMultipleStages}
      chapter={text.chapters[0]}
    />,
  )

  expect(
    screen.queryByText(new RegExp(_.escapeRegExp(stage))),
  ).not.toBeInTheDocument()

  commonTests(text)
})

test('Does not show dummy name', () => {
  const text = createText({
    chapters: [
      {
        stage: stage,
        name: '-',
        title: [{ type: 'StringPart', text: line }],
        uncertainFragments: [],
      },
    ],
  })
  render(
    <ChapterTitle
      showStage={text.hasMultipleStages}
      chapter={text.chapters[0]}
    />,
  )
  expect(screen.queryByText(/-/)).not.toBeInTheDocument()
})

test('Show dummy name', () => {
  const text = createText({
    chapters: [
      {
        stage: stage,
        name: '-',
        title: [],
        uncertainFragments: [],
      },
    ],
  })
  render(
    <ChapterTitle
      showStage={text.hasMultipleStages}
      chapter={text.chapters[0]}
    />,
  )
  expect(screen.queryByText(/-/)).toBeVisible()
})

test('ChapterTitleLink', () => {
  const text = createText({
    chapters: [
      {
        stage: stage,
        name: name,
        title: [{ type: 'StringPart', text: line }],
        uncertainFragments: [],
      },
    ],
  })
  render(
    <MemoryRouter>
      <ChapterTitleLink text={text} chapter={text.chapters[0]} />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    `/corpus/${text.genre}/${text.category}/${text.index}/${stageToAbbreviation(
      stage,
    )}/${name}`,
  )
  commonTests(text)
})

function commonTests(text: Text) {
  expect(screen.getByText(new RegExp(_.escapeRegExp(name)))).toBeVisible()
  expect(screen.getByText(new RegExp(_.escapeRegExp(line)))).toBeVisible()
}
