import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { Promise } from 'bluebird'
import _ from 'lodash'
import { submitFormByTestId, clickNth } from 'test-support/utils'
import {
  container,
  fragment,
  fragmentService,
  setup,
  updatedFragment,
} from 'fragmentarium/ui/fragment/cuneiformFragment.testSupport'

it('Renders CDLI number', async () => {
  await setup()
  expect(container).toHaveTextContent(fragment.getExternalNumber('cdliNumber'))
})

it('Renders museum', async () => {
  await setup()
  expect(container).toHaveTextContent(fragment.museum.name)
})

it('Renders all joins', async () => {
  await setup()
  const joinsSection = screen.getByText(
    (_content, element) =>
      element?.classList.contains('Details-joins') ?? false,
  )

  for (const join of fragment.joins.flat()) {
    expect(
      within(joinsSection).getByText(
        new RegExp(_.escapeRegExp(join.museumNumber)),
      ),
    ).toBeInTheDocument()
  }
})

it('Renders all measures', async () => {
  await setup()
  for (const property of ['length', 'width', 'thickness']) {
    expect(container).toHaveTextContent(fragment.measures[property])
  }
})

it('Renders all references', async () => {
  await setup()
  for (const reference of fragment.references) {
    expect(container).toHaveTextContent(reference.primaryAuthor)
  }
})

it('Renders all records', async () => {
  await setup()
  for (const uniqueRecord of fragment.uniqueRecord) {
    expect(container).toHaveTextContent(uniqueRecord.user)
  }
})

it('Renders all folios', async () => {
  await setup()
  for (const folio of fragment.folios) {
    expect(container).toHaveTextContent(folio.number)
  }
})

it('Updates view on Edition save', async () => {
  await setup()
  fragmentService.updateEdition.mockReturnValueOnce(
    Promise.resolve(updatedFragment),
  )

  submitFormByTestId(screen, 'transliteration-form')

  await screen.findAllByText(updatedFragment.getExternalNumber('cdliNumber'))
})

it('Updates view on References save', async () => {
  await setup()
  fragmentService.updateReferences.mockReturnValueOnce(
    Promise.resolve(updatedFragment),
  )
  clickNth(screen, 'References', 1)
  await screen.findAllByText('Document')
  submitFormByTestId(screen, 'references-form')

  await screen.findByText(updatedFragment.getExternalNumber('cdliNumber'))
})

it('Calls `updateDate` on Date save', async () => {
  await setup()
  fragmentService.updateDate.mockReturnValueOnce(
    Promise.resolve(updatedFragment),
  )
  const editButton = screen.getAllByLabelText('Edit date button')[0]
  fireEvent.click(editButton)
  const dayInput = screen.getByPlaceholderText('Day')
  fireEvent.change(dayInput, { target: { value: '3' } })
  const saveButton = screen.getByLabelText('Save date button')
  fireEvent.click(saveButton)
  expect(screen.getByText('Saving...')).toBeInTheDocument()
  await waitFor(() =>
    expect(fragmentService.updateDate).toHaveBeenCalledTimes(1),
  )
})

it('Calls `updateDate` with undefined on Date delete', async () => {
  await setup()
  fragmentService.updateDate.mockReturnValueOnce(Promise.resolve(fragment))

  const editButton = screen.getAllByLabelText('Edit date button')[0]
  fireEvent.click(editButton)

  const deleteButton = await screen.findByText('Delete')
  fireEvent.click(deleteButton)

  expect(screen.getByText('Saving...')).toBeInTheDocument()
  await waitFor(() =>
    expect(fragmentService.updateDate).toHaveBeenCalledWith(
      fragment.number,
      undefined,
    ),
  )
})

it('Calls `updateDatesInText` on Dates in text save', async () => {
  await setup()
  fragmentService.updateDatesInText.mockReturnValueOnce(
    Promise.resolve(updatedFragment),
  )
  const addButton = screen.getByLabelText('Add date button')
  fireEvent.click(addButton)
  const dayInput = screen.getByPlaceholderText('Day')
  fireEvent.change(dayInput, { target: { value: '3' } })
  const saveButton = screen.getByLabelText('Save date button')
  fireEvent.click(saveButton)
  await waitFor(() =>
    expect(fragmentService.updateDatesInText).toHaveBeenCalledTimes(1),
  )
})

it('Shows the error and stops saving when a save fails', async () => {
  await setup()
  fragmentService.updateEdition.mockReturnValueOnce(
    Promise.reject(new Error('Save failed.')),
  )

  submitFormByTestId(screen, 'transliteration-form')

  await screen.findByText('Save failed.')
  expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
})

it('Collapses the image column when the editor asks for the space', async () => {
  await setup()
  expect(screen.getAllByText('Photo').length).toBeGreaterThan(0)

  fireEvent.click(screen.getByRole('button', { name: 'Hide Image Column' }))

  await waitFor(() =>
    expect(screen.queryByText('Photo')).not.toBeInTheDocument(),
  )
})
