import React from 'react'
import {
  EntityAnnotationSpan,
  EntityTypes,
} from 'fragmentarium/ui/text-annotation/EntityType'
import { act, render } from '@testing-library/react'
import SpanEditor from 'fragmentarium/ui/text-annotation/SpanEditor'

let container: HTMLElement
const setActiveSpanId = jest.fn()

const entitySpan: EntityAnnotationSpan = {
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-2'],
  tier: 1,
  name: EntityTypes['PERSONAL_NAME'].name,
}

describe('SpanEditor', () => {
  beforeEach(async () => {
    await act(async () => {
      container = render(
        <SpanEditor entitySpan={entitySpan} setActiveSpanId={setActiveSpanId} />
      ).container
    })
  })
  it('shows the selection menu', () => {
    expect(container).toMatchSnapshot()
  })
})
