import React from 'react'
import { render } from '@testing-library/react'
import ExternalLink from './ExternalLink'

const href = 'http://example.com'
const title = 'The Title'
const children = 'The Link'
let link

beforeEach(() => {
  const { getByText } = render(
    <ExternalLink href={href} title={title}>
      {children}
    </ExternalLink>
  )
  link = getByText(children)
})

it('Is an anchor', () => {
  expect(link.nodeName).toEqual('A')
})

it('Has the given href', () => {
  expect(link).toHaveAttribute('href', href)
})

it('Has the given title', () => {
  expect(link).toHaveAttribute('title', title)
})

it('Opens in a new tab', () => {
  expect(link).toHaveAttribute('target', '_blank')
})

it('Has noopener and noreferrer', () => {
  expect(link).toHaveAttribute('rel', 'noopener noreferrer')
})
