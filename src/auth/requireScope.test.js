import React from 'react'
import { render } from 'react-testing-library'
import requireScope from './requireScope'
import Auth from './Auth'

const content = 'InnerComponent'
const InnerComponent = props => <h1>{content}</h1>
let auth
let scope
let ComponentRequiringScope

beforeEach(async () => {
  auth = new Auth()
  jest.spyOn(auth, 'hasScope')
  ComponentRequiringScope = requireScope(InnerComponent, scope)
})

it('Renders inner component if use has the scope', () => {
  auth.hasScope.mockReturnValueOnce(true)
  const { container } = render(<ComponentRequiringScope auth={auth} />)
  expect(container).toHaveTextContent(content)
})

it('Does not render inner component if user does not have the scope', () => {
  auth.hasScope.mockReturnValueOnce(false)
  const { container } = render(<ComponentRequiringScope auth={auth} />)
  expect(container).not.toHaveTextContent(content)
})
