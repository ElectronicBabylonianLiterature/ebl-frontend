import React from 'react'
import { render, screen } from '@testing-library/react'
import { chapterIdFactory } from 'test-support/chapter-fixtures'
import ChapterCrumb from './ChapterCrumb'
import { stageToAbbreviation } from 'common/period'

const id = chapterIdFactory.build()
const crumb = new ChapterCrumb(id)

test('text', () => {
  render(<>{crumb.text}</>)
  expect(screen.getByText(`Chapter ${id.stage} ${id.name}`)).toBeVisible()
})

test('link', () => {
  expect(crumb.link).toEqual(
    `/corpus/${id.textId.genre}/${id.textId.category}/${
      id.textId.index
    }/${stageToAbbreviation(id.stage)}/${id.name}`,
  )
})
