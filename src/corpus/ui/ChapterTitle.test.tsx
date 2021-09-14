import { render, screen } from '@testing-library/react'
import { createText } from 'corpus/domain/text'
import _ from 'lodash'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { Text } from 'corpus/domain/text'
import ChapterTitle from './ChapterTitle'

const stage = 'Old Babyloian'
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
    <MemoryRouter>
      <ChapterTitle text={text} chapter={text.chapters[0]} />
    </MemoryRouter>
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
    <MemoryRouter>
      <ChapterTitle text={text} chapter={text.chapters[0]} />
    </MemoryRouter>
  )
  expect(
    screen.queryByText(new RegExp(_.escapeRegExp(stage)))
  ).not.toBeInTheDocument()

  commonTests(text)
})

function commonTests(text: Text) {
  expect(screen.getByText(new RegExp(_.escapeRegExp(name)))).toBeVisible()
  expect(screen.getByText(new RegExp(_.escapeRegExp(line)))).toBeVisible()
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    `/corpus/${text.genre}/${text.category}/${text.index}/${stage}/${name}`
  )
}
