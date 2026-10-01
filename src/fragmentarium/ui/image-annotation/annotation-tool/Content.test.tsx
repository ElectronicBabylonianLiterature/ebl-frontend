import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Content from 'fragmentarium/ui/image-annotation/annotation-tool/Content'
import Annotation from 'fragmentarium/domain/annotation'
import { annotations } from 'test-support/test-annotation'

const annotation = annotations[0]

function renderContent(
  disabled: boolean,
  shown: Annotation = annotation,
  displayCards = true,
): {
  onDelete: jest.Mock
  setHovering: jest.Mock
  unmount: () => void
} {
  const onDelete = jest.fn().mockResolvedValue(undefined)
  const setHovering = jest.fn()
  const { unmount } = render(
    <Content
      annotation={shown}
      onDelete={onDelete}
      contentScale={1}
      setHovering={setHovering}
      displayCards={displayCards}
      disabled={disabled}
    />,
  )
  return { onDelete, setHovering, unmount }
}

function pressDelete(): void {
  fireEvent.keyPress(document, { code: 'Delete', charCode: 127 })
}

it('deletes the annotation from its card', async () => {
  const { onDelete } = renderContent(false)

  await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

  expect(onDelete).toHaveBeenCalledWith(annotation)
})

it('deletes the annotation with the Delete key', () => {
  const { onDelete } = renderContent(false)

  pressDelete()

  expect(onDelete).toHaveBeenCalledWith(annotation)
})

it('ignores other keys', () => {
  const { onDelete } = renderContent(false)

  fireEvent.keyPress(document, { code: 'KeyA', charCode: 97 })

  expect(onDelete).not.toHaveBeenCalled()
})

it('blocks both deletes while disabled', () => {
  const { onDelete } = renderContent(true)

  expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  pressDelete()

  expect(onDelete).not.toHaveBeenCalled()
})

it('tracks hovering while mounted', () => {
  const { setHovering, unmount } = renderContent(false)
  expect(setHovering).toHaveBeenLastCalledWith(annotation)

  unmount()

  expect(setHovering).toHaveBeenLastCalledWith(null)
  pressDelete()
})

it('shows the value and sign of a current annotation', () => {
  renderContent(false)

  expect(screen.getByText('kur/ KUR')).toBeInTheDocument()
})

it('shows an outdated annotation without a sign name', () => {
  renderContent(false, {
    ...annotation,
    outdated: true,
    data: { ...annotation.data, signName: '' },
  })

  expect(screen.getByText('kur')).toBeInTheDocument()
})

it('hides the card when cards are not displayed', () => {
  renderContent(false, annotation, false)

  expect(
    screen.queryByRole('button', { name: 'Delete' }),
  ).not.toBeInTheDocument()
})
