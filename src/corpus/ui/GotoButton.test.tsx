import React from 'react'
import { produce } from 'immer'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Text } from 'corpus/domain/text'
import { text } from 'test-support/test-corpus-text'
import GotoButton from './GotoButton'

const title = 'goto'

test('Single stage', async () => {
  await openDropdown(text)

  expectLink(text.chapters[0].name, '/corpus/L/1/1/OB/The Only Chapter')
  expectLink('Introduction', '/corpus/L/1/1')
})

test('Multiple stages', async () => {
  const multiStageText = produce(text, (draft) => {
    draft.chapters.push({
      ...draft.chapters[0],
      stage: 'Old Assyrian',
    })
  })

  await openDropdown(multiStageText)

  expectLink(
    `${multiStageText.chapters[0].stage} ${multiStageText.chapters[0].name}`,
    '/corpus/L/1/1/OB/The Only Chapter',
  )
  expectLink(
    `${multiStageText.chapters[1].stage} ${multiStageText.chapters[1].name}`,
    '/corpus/L/1/1/OA/The Only Chapter',
  )
  expectLink('Introduction', '/corpus/L/1/1')
})

async function openDropdown(text: Text) {
  render(<GotoButton title={title} text={text} />)
  await userEvent.click(screen.getByRole('button', { name: title }))
  await waitFor(() => screen.findAllByRole('link'))
}

function expectLink(name: string, href: string) {
  expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
}
