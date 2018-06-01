import React from 'react'
import ReactDOM from 'react-dom'
import Dictionary from './Dictionary'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Dictionary />, div)
  ReactDOM.unmountComponentAtNode(div)
})
