import React from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import SignService from 'signs/application/SignService'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import FragmentAnnotation from 'fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { signFactory } from 'test-support/sign-fixtures'
import Promise from 'bluebird'
import Annotation, {
  AnnotationTokenType,
  isBoundingBoxTooSmall,
} from 'fragmentarium/domain/annotation'
import userEvent from '@testing-library/user-event'

import textLine from 'test-support/lines/text-line'
import { Text } from 'transliteration/domain/text'
import ApiClient from 'http/ApiClient'
import SignRepository from 'signs/infrastructure/SignRepository'
import { MemoryRouter } from 'react-router-dom'
import { createAnnotationTokens } from 'fragmentarium/ui/image-annotation/annotation-tool/mapTokensToAnnotationTokens'

global.ResizeObserver = ResizeObserver

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
  {
    id: 'id_1',
    type: AnnotationTokenType.HasSign,
    value: 'erin₂',
    path: [0, 0, 0],
    signName: 'EREN₂',
  }
)

beforeEach(async () => {
  jest.spyOn(signsRepository, 'search').mockReturnValue(Promise.resolve([sign]))
  jest
    .spyOn(fragmentService, 'updateAnnotations')
    .mockReturnValue(Promise.resolve([]))

  render(
    <MemoryRouter>
      <FragmentAnnotation
        image={new Blob()}
        fragment={fragment}
        initialAnnotations={[initialAnnotation]}
        fragmentService={fragmentService}
        signService={signService}
      />
    </MemoryRouter>
  )
  await screen.findByText('Click and Drag to Annotate')
})
it('hover with disabled content', async () => {
  expect(screen.getByTestId('annotation__box')).toBeVisible()
  userEvent.hover(screen.getByTestId('annotation__target'))
  expect(screen.queryByText('Delete')).not.toBeInTheDocument()
})

it('hover makes editor button dark', async () => {
  userEvent.click(screen.getByText('Show Card'))
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
  expect(screen.getAllByText(/erin₂/).length).toBe(2)
  expect(screen.getByTestId('annotation__box')).toBeVisible()
  fireEvent.keyDown(screen.getByTestId('annotation__box'), {
    key: 'y',
    code: 'y',
    keyCode: 89,
    charCode: 89,
  })
  userEvent.click(screen.getByTestId('annotation__target'))
  userEvent.click(screen.getByText('Show Card'))
  await waitFor(() => expect(screen.getByText(/change existing/)).toBeVisible())
  userEvent.click(screen.getByRole('button', { name: 'kur' }))
  userEvent.hover(screen.getByTestId('annotation__target'))
  await screen.findByText('Delete')
  await waitFor(() => expect(screen.getAllByText(/kur/).length).toBe(3))
  const expectedData = tokens.flat().filter((token) => token.value === 'kur')[0]
  const expectedAnnotation = new Annotation(initialAnnotation.geometry, {
    id: initialAnnotation.data.id,
    value: 'kur',
    type: AnnotationTokenType.HasSign,
    path: expectedData.path,
    signName: sign.name,
  })
  userEvent.click(screen.getByRole('button', { name: 'Save' }))
  await screen.findByRole('button', { name: 'Save' })
  expect(
    fragmentService.updateAnnotations
  ).toHaveBeenCalledWith('Test.Fragment', [expectedAnnotation])
})

it('Generate Annotations', async () => {
  jest.spyOn(fragmentService, 'generateAnnotations').mockReturnValue(
    Promise.resolve([
      new Annotation(
        { x: 50, y: 50, width: 10, height: 10, type: 'RECTANGLE' },
        {
          id: 'id_2',
          value: '',
          type: AnnotationTokenType.Blank,
          path: [-1],
          signName: '',
        }
      ),
    ])
  )
  userEvent.click(screen.getByRole('button', { name: 'Generate Annotations' }))
  expect(fragmentService.generateAnnotations).toHaveBeenCalledTimes(1)
  await waitFor(() =>
    expect(screen.getAllByTestId('annotation__box').length).toBe(2)
  )
})
it('Change existing annotation mode and then back to default mode', async () => {
  expect(screen.getByTestId('annotation__box')).toBeVisible()
  fireEvent.keyDown(screen.getByTestId('annotation__box'), {
    key: 'y',
    code: 'y',
    keyCode: 89,
    charCode: 89,
  })
  userEvent.click(screen.getByTestId('annotation__target'))
  await waitFor(() => expect(screen.getByText(/change existing/)).toBeVisible())
  userEvent.keyboard('{Escape}')
  await waitFor(() => expect(screen.getByText(/default/)).toBeVisible())
})
it('delete specific annotation', async () => {
  userEvent.click(screen.getByText('Show Card'))
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

it('delete everything', async () => {
  userEvent.click(screen.getByText('Show Card'))
  const confirmMock = jest
    .spyOn(window, 'confirm')
    .mockImplementation(() => true)
  expect(screen.getByTestId('annotation__box')).toBeVisible()
  userEvent.click(screen.getByText('Delete all'))
  expect(confirmMock).toHaveBeenCalledTimes(1)
  await waitFor(() => {
    expect(screen.queryByTestId('annotation__box')).not.toBeInTheDocument()
  })
  expect(fragmentService.updateAnnotations).toHaveBeenCalledWith(
    'Test.Fragment',
    []
  )
})

it('isBoundingBoxTooSmall', () => {
  const geometryTooSmall = {
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    type: 'RECTANGLE',
  }
  const geometryValid = {
    x: 0,
    y: 0,
    height: 0.35,
    width: 0.35,
    type: 'RECTANGLE',
  }
  expect(isBoundingBoxTooSmall(geometryTooSmall)).toBe(false)
  expect(isBoundingBoxTooSmall(geometryValid)).toBe(true)
})
