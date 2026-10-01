import React from 'react'
import { render, screen } from '@testing-library/react'
import FragmentAnnotationToolbar from 'fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotationToolbar'

const writeButtons = ['Generate Annotations', 'Delete all', 'Save']

function renderToolbar(isWriting: boolean): void {
  render(
    <FragmentAnnotationToolbar
      isGenerateAnnotationsLoading={false}
      isAutomaticSelected={false}
      isDeleting={false}
      isSaving={false}
      isWriting={isWriting}
      displayCards={false}
      isChangeExistingMode={false}
      generateAnnotations={jest.fn()}
      toggleAutomaticSelection={jest.fn()}
      deleteAllAnnotations={jest.fn()}
      saveCurrentAnnotations={jest.fn()}
      toggleDisplayCards={jest.fn()}
    />,
  )
}

it.each(writeButtons)('disables %s while a write is pending', (name) => {
  renderToolbar(true)

  expect(screen.getByRole('button', { name })).toBeDisabled()
})

it.each(writeButtons)('enables %s when no write is pending', (name) => {
  renderToolbar(false)

  expect(screen.getByRole('button', { name })).toBeEnabled()
})

it('keeps the view toggles available while a write is pending', () => {
  renderToolbar(true)

  expect(
    screen.getByRole('button', { name: 'Automatic Selection' }),
  ).toBeEnabled()
  expect(screen.getByRole('button', { name: 'Show Card' })).toBeEnabled()
})
