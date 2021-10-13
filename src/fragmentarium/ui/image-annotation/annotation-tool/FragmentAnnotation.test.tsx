import React from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import SignService from 'signs/application/SignService'
import { render, screen, waitFor } from '@testing-library/react'
import FragmentAnnotation from 'fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { signFactory } from 'test-support/sign-fixtures'
import Promise from 'bluebird'
import Annotation from 'fragmentarium/domain/annotation'
import userEvent from '@testing-library/user-event'
import { createAnnotationTokens } from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'
import textLine from 'test-support/lines/text-line'
import { Text } from 'transliteration/domain/text'
import ApiClient from 'http/ApiClient'
import SignRepository from 'signs/infrastructure/SignRepository'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const signsRepository = new SignRepository(apiClient)
const signService = new SignService(signsRepository)

const sign = signFactory.build()

const text = new Text({ lines: [textLine] })
const fragment = fragmentFactory.build({ number: 'Test.Fragment', text: text })
const tokens = createAnnotationTokens(fragment.text)

const initialAnnotation = new Annotation(
  { x: 50, y: 50, width: 10, height: 10, type: 'RECTANGLE' },
  { id: 'id_1', value: 'erin₂', path: [0, 0, 0], signName: 'EREN₂' }
)

beforeEach(async () => {
  jest.spyOn(signsRepository, 'search').mockReturnValue(Promise.resolve([sign]))
  render(
    <FragmentAnnotation
      image={new Blob()}
      fragment={fragment}
      initialAnnotations={[initialAnnotation]}
      fragmentService={fragmentService}
      signService={signService}
    />
  )
  await screen.findByText('Click and Drag to Annotate')
})
it('hover makes editor button dark', async () => {
  expect(screen.getByTestId('annotation__box')).toBeVisible()
  userEvent.hover(screen.getByTestId('annotation__target'))
  await screen.findByText('Delete')
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'erin₂' })).toHaveClass(
      'btn-dark'
    )
  )
})

it('Change existing annotation', async () => {
  expect(screen.getAllByText(/erin₂/).length).toBe(1)
  expect(screen.getByTestId('annotation__box')).toBeVisible()
  userEvent.click(screen.getByTestId('annotation__target'), { ctrlKey: true })
  await waitFor(() => expect(screen.getByText(/change existing/)).toBeVisible())
  userEvent.click(screen.getByRole('button', { name: 'ŠA₂' }))
  userEvent.hover(screen.getByTestId('annotation__target'))
  await screen.findByText('Delete')
  await waitFor(() => expect(screen.getAllByText(/ŠA₂/).length).toBe(2))
  const expectedData = tokens.flat().filter((token) => token.value === 'ŠA₂')[0]
  const expectedAnnotation = new Annotation(initialAnnotation.geometry, {
    id: initialAnnotation.data.id,
    value: 'ŠA₂',
    path: expectedData.path,
    signName: sign.name,
  })
  expect(
    fragmentService.updateAnnotations
  ).toHaveBeenCalledWith('Test.Fragment', [expectedAnnotation])
})
it('Change existing annotation mode and then back to default mode', async () => {
  expect(screen.getByTestId('annotation__box')).toBeVisible()
  userEvent.click(screen.getByTestId('annotation__target'), { ctrlKey: true })
  await waitFor(() => expect(screen.getByText(/change existing/)).toBeVisible())
  userEvent.keyboard('{Escape}')
  await waitFor(() => expect(screen.getByText(/default/)).toBeVisible())
})

it('delete annotation', async () => {
  expect(screen.getByTestId('annotation__box')).toBeVisible()
  userEvent.hover(screen.getByTestId('annotation__target'))
  await screen.findByText('Delete')
  userEvent.click(screen.getByText('Delete'))
  await waitFor(() =>
    expect(screen.queryByTestId('annotation__box')).not.toBeInTheDocument()
  )
  expect(fragmentService.updateAnnotations).toHaveBeenCalledWith(
    'Test.Fragment',
    []
  )
})