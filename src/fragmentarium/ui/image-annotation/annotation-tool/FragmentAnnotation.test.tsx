import React from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import SignService from 'signs/application/SignService'
import { fireEvent, render, screen } from '@testing-library/react'
import FragmentAnnotation from 'fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { signFactory } from 'test-support/sign-fixtures'
import Promise from 'bluebird'
import Annotation from 'fragmentarium/domain/annotation'
import userEvent from '@testing-library/user-event'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('signs/application/SignService')
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()

const fragment = fragmentFactory.build()
const sign = signFactory.build()
const image = './image.jpeg'
let initialAnnotation

beforeEach(async () => {
  signService.search.mockReturnValue(Promise.all([sign]))

  initialAnnotation = [
    new Annotation(
      { x: 100.0, y: 45.7, width: 0.02, height: 4, type: 'RECTANGLE' },
      { id: 'abc123', value: 'kur', path: [2, 3, 0] }
    ),
  ]
  render(
    <FragmentAnnotation
      image={image}
      fragment={fragment}
      initialAnnotations={initialAnnotation}
      fragmentService={fragmentService}
      signService={signService}
    />
  )
  await screen.findByTestId('annotation__box')
})

it('Tst', async () => {
  expect(screen.getByText('blank')).toBeVisible()
  expect(screen.getByTestId('annotation__box')).toBeVisible()
  //fireEvent.mouseOver(screen.getByTestId("annotation__box"))

  userEvent.hover(screen.getByTestId('annotation__box'))
  await screen.findByTestId('content')
  //await screen.findByText("Delete")
  //expect(screen.getByText("Delete")).toBeInTheDocument()
})

it('Change existing annotation', async () => {
  expect(screen.getByText('blank')).toBeVisible()
  expect(screen.getByTestId('annotation__box')).toBeVisible()
  userEvent.keyboard('[ControlLeft>]')
  userEvent.click(screen.getByTestId('annotation__box'))
  await screen.findByText(/change existing/)
})
it('Image', async () => {
  await screen.findByText(/Mode:/)
  await screen.findByRole('img')
  //const img = screen.getByRole("img")
  //screen.debug()
})
it('Click', async () => {
  fireEvent.click(screen.getByTestId('annotation__box'))
  await screen.findByText(/Mode:/)
})
