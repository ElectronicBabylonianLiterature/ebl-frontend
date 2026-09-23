import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  MuseumName,
  Measurements,
  ExcavationDate,
} from 'fragmentarium/ui/info/DetailsFields'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Museums } from 'fragmentarium/domain/museum'
import { fragmentFactory } from 'test-support/fragment-fixtures'

function renderField(element: JSX.Element): void {
  render(<MemoryRouter>{element}</MemoryRouter>)
}

function buildFragment(overrides: Partial<Fragment>): Fragment {
  return { ...fragmentFactory.build(), ...overrides } as Fragment
}

test('A museum without a URL is shown as plain text', () => {
  const museum = Museums.PRIVATE_COLLECTION_CHICAGO
  renderField(<MuseumName fragment={buildFragment({ museum })} />)

  expect(screen.getByText(museum.name)).toBeVisible()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})

test('A fragment without measurements shows nothing', () => {
  const { container } = render(
    <Measurements
      fragment={buildFragment({
        measures: {
          length: null,
          width: null,
          thickness: null,
          lengthNote: null,
          widthNote: null,
          thicknessNote: null,
        },
      })}
    />,
  )

  expect(container).toBeEmptyDOMElement()
})

test('An irregular excavation with a date is labelled and dated', () => {
  renderField(
    <ExcavationDate
      fragment={buildFragment({
        archaeology: {
          isRegularExcavation: false,
          date: {
            start: { year: 1900, month: null, day: null },
            notes: 'noted',
          },
        },
      } as unknown as Partial<Fragment>)}
    />,
  )

  expect(screen.getByText(/Irregular Excavation/)).toBeVisible()
  expect(screen.getByText(/noted/)).toBeVisible()
})

test('An irregular excavation without a date renders no label', () => {
  const { container } = render(
    <ExcavationDate
      fragment={buildFragment({
        archaeology: { isRegularExcavation: false },
      } as unknown as Partial<Fragment>)}
    />,
  )

  expect(container).toBeEmptyDOMElement()
})
