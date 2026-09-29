import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { createVariant, LineVariant } from 'corpus/domain/line'
import LineVariantForm from 'corpus/ui/lines/LineVariantForm'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const variant = createVariant({
  reconstruction: 'kur',
  intertext: 'intertext',
})

test.each([
  [/^Intertext-/, 'intertext', 'new intertext'],
  [/^IdealReconstruction-/, 'reconstruction', 'ra'],
])('changing %s updates %s', (label, property, newValue) => {
  const onChange = jest.fn<void, [LineVariant]>()
  render(
    <LineVariantForm value={variant} manuscripts={[]} onChange={onChange} />,
  )

  fireEvent.change(screen.getByLabelText(label), {
    target: { value: newValue },
  })

  expect(onChange).toHaveBeenCalledWith(
    createVariant({ ...variant, [property]: newValue }),
  )
})
