import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RenderResult } from '@testing-library/react'
import ProperNounCreationPanel from 'fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel'
import WordService from 'dictionary/application/WordService'
import { wordFactory } from 'test-support/word-fixtures'

export interface ProperNounPanelTestContext {
  wordServiceMock: jest.Mocked<WordService>
  onCloseMock: jest.Mock
  onCreatedMock: jest.Mock
  renderPanel: () => RenderResult
}

export function createProperNounPanelTestContext(): ProperNounPanelTestContext {
  const wordServiceMock = new (WordService as jest.Mock<
    jest.Mocked<WordService>
  >)()
  const onCloseMock = jest.fn()
  const onCreatedMock = jest.fn()

  return {
    wordServiceMock: wordServiceMock,
    onCloseMock: onCloseMock,
    onCreatedMock: onCreatedMock,
    renderPanel: () =>
      render(
        <ProperNounCreationPanel
          wordService={wordServiceMock}
          onClose={onCloseMock}
          onCreated={onCreatedMock}
        />,
      ),
  }
}

export function resetProperNounPanelMocks(
  wordServiceMock: jest.Mocked<WordService>,
): void {
  jest.clearAllMocks()
  wordServiceMock.searchLemma.mockResolvedValue([])
  wordServiceMock.createProperNoun.mockResolvedValue(
    wordFactory.build({ lemma: ['Test'] }),
  )
}

export async function fillProperNounForm(
  name: string,
  tag = 'DN',
): Promise<HTMLElement> {
  fireEvent.change(screen.getByLabelText('properNoun-input'), {
    target: { value: name },
  })
  fireEvent.change(screen.getByLabelText('properNoun-type-select'), {
    target: { value: tag },
  })
  const createButton = screen.getByLabelText('save-properNoun-creation')
  await waitFor(() => {
    expect(createButton).toBeEnabled()
  })
  return createButton
}
