import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MesZlText from 'signs/ui/display/MesZlText'
import LocationDisplay from 'test-support/LocationDisplay'

function mountText(): HTMLElement {
  render(
    <MemoryRouter initialEntries={['/signs/ŠE']}>
      <MesZlText text={'579\tŠE\nsiehe n117.'} chapter="kap3" />
      <LocationDisplay />
    </MemoryRouter>,
  )
  return screen.getByRole('article')
}

it('routes internal references within the app', async () => {
  mountText()
  fireEvent.click(await screen.findByRole('link', { name: 'n117' }))
  expect(screen.getByTestId('location')).toHaveTextContent(
    '/tools/signs?listsName=MZL&listsNumber=117',
  )
})

it('leaves references to other sites to the browser', async () => {
  const articleElement = mountText()
  await screen.findByRole('link', { name: 'n117' })
  const external = document.createElement('a')
  external.className = 'MesZl__reference'
  external.href = 'https://example.com/tools/signs'
  external.textContent = 'external'
  articleElement.appendChild(external)
  external.addEventListener('click', (event) => event.preventDefault())
  fireEvent.click(external)
  expect(screen.getByTestId('location')).toHaveTextContent('/signs/ŠE')
})
