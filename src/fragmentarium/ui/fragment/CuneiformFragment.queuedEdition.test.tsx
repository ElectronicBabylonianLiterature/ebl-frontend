import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { deferred } from 'test-support/concurrencyLimiterHelpers'
import { setUpCuneiformFragment } from 'fragmentarium/ui/fragment/cuneiformFragment.testSupport'
import { ApiError } from 'http/ApiClient'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FindspotService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('afo-register/application/AfoRegisterService')
jest.mock('auth/Session')

it('keeps the saved edition clean when a queued genre update fails', async () => {
  const context = await setUpCuneiformFragment()
  const editionSave = deferred<Fragment>()
  let rejectGenres: (error: Error) => void = () => undefined
  const genreSave = new Promise<Fragment>((_resolve, reject) => {
    rejectGenres = reject
  })
  context.fragmentService.updateEdition.mockReturnValueOnce(editionSave.promise)
  context.fragmentService.updateGenres.mockReturnValueOnce(genreSave)
  const savedEdition = fragmentFactory.build({
    number: context.fragment.number,
    atf: '1. [...]  [...]',
    notes: context.fragment.notes,
    introduction: context.fragment.introduction,
  })

  const template = screen.getByRole('textbox', { name: 'Template' })
  expect(screen.getByTestId('transliteration-form')).not.toContainElement(
    template,
  )
  fireEvent.change(template, { target: { value: '1' } })
  fireEvent.submit(template)
  expect(context.fragmentService.updateEdition).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() =>
    expect(context.fragmentService.updateEdition).toHaveBeenCalledWith(
      context.fragment.number,
      { transliteration: savedEdition.atf },
    ),
  )

  await userEvent.click(screen.getByLabelText('edit-genre'))
  await userEvent.type(
    screen.getByLabelText('select-genre'),
    'Administrative{enter}',
  )
  await userEvent.click(screen.getByLabelText('add-genre'))
  expect(context.fragmentService.updateGenres).not.toHaveBeenCalled()

  await act(async () => editionSave.resolve(savedEdition))
  await waitFor(() =>
    expect(context.fragmentService.updateGenres).toHaveBeenCalledTimes(1),
  )
  expect(screen.getByText('Saving...')).toBeInTheDocument()

  await act(async () =>
    rejectGenres(new ApiError('Genre update failed', {}, 500)),
  )

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Genre update failed',
  )
  expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  expect(
    screen.getAllByText(savedEdition.getExternalNumber('cdliNumber')).length,
  ).toBeGreaterThan(0)
  const beforeUnload = new Event('beforeunload')
  Object.defineProperty(beforeUnload, 'returnValue', {
    value: '',
    writable: true,
  })
  fireEvent(window, beforeUnload)
  expect(beforeUnload.returnValue).toBe('')
})
