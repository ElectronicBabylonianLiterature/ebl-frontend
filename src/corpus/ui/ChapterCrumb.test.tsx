import React from 'react'
import { render, screen } from '@testing-library/react'
import { chapterIdFactory } from 'test-support/chapter-fixtures'
import ChapterCrumb from './ChapterCrumb'
import { stageToAbbreviation } from 'common/utils/period'

const id = chapterIdFactory.build()
const crumb = new ChapterCrumb(id)

test('text', () => {
  render(<>{crumb.text}</>)
  expect(screen.getByText(`Chapter ${id.stage} ${id.name}`)).toBeVisible()
})

test('link', () => {
  const stage = id.stage ? stageToAbbreviation(id.stage) : ''
  const parts = [
    'corpus',
    id.textId.genre,
    String(id.textId.category),
    String(id.textId.index),
    stage,
    id.name,
  ].filter((part) => part !== '')

  expect(crumb.link).toEqual(`/${parts.join('/')}`)
})

test('link omits empty stage segment', () => {
  const stageLessCrumb = new ChapterCrumb({
    ...id,
    stage: '',
  })

  expect(stageLessCrumb.link).toEqual(
    `/corpus/${id.textId.genre}/${id.textId.category}/${id.textId.index}/${id.name}`,
  )
})
