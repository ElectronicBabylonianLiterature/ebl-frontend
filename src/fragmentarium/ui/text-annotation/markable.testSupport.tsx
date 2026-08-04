import React from 'react'
import { render, screen } from '@testing-library/react'
import Markable from 'fragmentarium/ui/text-annotation/Markable'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import { WithRealiaService } from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { atfTokenKur } from 'test-support/test-tokens'
import DisplayToken from 'transliteration/ui/DisplayToken'

export const word = { ...atfTokenKur, id: 'Word-1' }
export const word2 = { ...atfTokenKur, id: 'Word-2' }

export function renderWithAnnotationContext(
  ui: React.ReactElement,
  words: string[] = ['Word-1'],
): void {
  render(
    <WithRealiaService>
      <AnnotationContext.Provider
        value={[{ namedEntities: [], realia: [], words }, jest.fn()]}
      >
        {ui}
      </AnnotationContext.Provider>
    </WithRealiaService>,
  )
}

export interface TwoMarkables {
  container: HTMLElement
  separator: HTMLElement
  firstMarkable: HTMLElement
  secondMarkable: HTMLElement
}

export function renderTwoMarkables(
  setSelection: jest.Mock,
  setActiveSpanId: jest.Mock = jest.fn(),
): TwoMarkables {
  const markableProps = {
    selection: [],
    setSelection,
    activeSpanId: null,
    setActiveSpanId,
  }

  renderWithAnnotationContext(
    <div data-testid="container">
      <Markable token={word} {...markableProps}>
        <DisplayToken token={word} />
      </Markable>
      <span data-testid="separator" />
      <Markable token={word2} {...markableProps}>
        <DisplayToken token={word2} />
      </Markable>
    </div>,
    ['Word-1', 'Word-2'],
  )

  const [firstMarkable, secondMarkable] = screen.getAllByRole('button')

  return {
    container: screen.getByTestId('container'),
    separator: screen.getByTestId('separator'),
    firstMarkable,
    secondMarkable,
  }
}

export function mockBrowserSelection(selection: unknown): () => void {
  const documentSelection = jest
    .spyOn(document, 'getSelection')
    .mockReturnValue(selection as Selection)
  const windowSelection = jest
    .spyOn(window, 'getSelection')
    .mockReturnValue(selection as Selection)

  return () => {
    documentSelection.mockRestore()
    windowSelection.mockRestore()
  }
}
