import React from 'react'
import SpanAnnotator from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import { act, render } from '@testing-library/react'

let container: HTMLElement
const selection = ['Word-1', 'Word-2']
const setSelection = jest.fn()

describe('SpanAnnotator', () => {
  beforeEach(async () => {
    await act(async () => {
      container = render(
        <SpanAnnotator selection={selection} setSelection={setSelection} />
      ).container
    })
  })
  it('shows the selection menu', () => {
    expect(container).toMatchSnapshot()
  })
})
