import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import ChapterSiglumsAndTransliterations from 'corpus/ui/ChapterSiglumsAndTransliterations'
import { chapter } from 'test-support/test-corpus-text'
import { Text } from 'transliteration/domain/text'
import SiglumAndTransliteration from 'corpus/domain/SiglumAndTransliteration'

function renderSiglums(
  siglums: readonly SiglumAndTransliteration[],
): ReturnType<typeof render> {
  const textService = {
    findColophons: jest.fn().mockResolvedValue(siglums),
    findUnplacedLines: jest.fn(),
  }
  return render(
    <ChapterSiglumsAndTransliterations
      id={chapter.id}
      textService={textService}
      method="findColophons"
    />,
  )
}

it('shows the transliteration of each siglum under the chapter name', async () => {
  renderSiglums([
    { siglum: 'NinNA1a', text: new Text({ lines: [] }) },
    { siglum: 'UrOB2', text: new Text({ lines: [] }) },
  ])

  expect(
    await screen.findByRole('heading', { name: `Chapter ${chapter.id.name}` }),
  ).toBeVisible()
  expect(screen.getByRole('heading', { name: 'NinNA1a' })).toBeVisible()
  expect(screen.getByRole('heading', { name: 'UrOB2' })).toBeVisible()
})

it('renders nothing when there are no siglums', async () => {
  const { container } = renderSiglums([])

  await waitFor(() => expect(container).toBeEmptyDOMElement())
})
