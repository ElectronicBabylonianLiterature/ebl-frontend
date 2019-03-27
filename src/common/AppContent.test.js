import React from 'react'
import { render } from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import AppContent from './AppContent'

let element

test('Title', () => {
  element = render(<MemoryRouter><AppContent crumbs={['Dictionary', 'Active']} title='Title' /></MemoryRouter>)
  expect(element.container).toHaveTextContent('eBLDictionaryActiveTitle')
})

test('Section and active', () => {
  element = render(<MemoryRouter><AppContent crumbs={['Dictionary', 'Active']} /></MemoryRouter>)
  expect(element.container).toHaveTextContent('eBLDictionaryActive')
})

test('Section', () => {
  element = render(<MemoryRouter><AppContent crumbs={['The Section']} /></MemoryRouter>)
  expect(element.container).toHaveTextContent('eBLThe Section')
})

test('No props', () => {
  element = render(<MemoryRouter><AppContent /></MemoryRouter>)
  expect(element.container).toHaveTextContent('eBL')
})

test('Children', () => {
  element = render(<MemoryRouter><AppContent>Children</AppContent></MemoryRouter>)
  expect(element.container).toHaveTextContent('eBLChildren')
})
