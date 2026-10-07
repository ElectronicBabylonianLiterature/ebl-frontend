import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MemorySession from 'auth/Session'
import SessionContext from 'auth/SessionContext'
import { EditChapterButton } from 'corpus/ui/ChapterView'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'

const chapter = chapterDisplayFactory.build()

function renderButton(scopes: readonly string[]): void {
  render(
    <MemoryRouter>
      <SessionContext.Provider value={new MemorySession(scopes)}>
        <EditChapterButton chapter={chapter} />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

it('links to the chapter editor for users who may write texts', () => {
  renderButton(['write:texts'])

  expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
    'href',
    expect.stringMatching(/\/edit$/),
  )
})

it('shows a disabled button to users who may not write texts', () => {
  renderButton([])

  expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled()
  expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument()
})
