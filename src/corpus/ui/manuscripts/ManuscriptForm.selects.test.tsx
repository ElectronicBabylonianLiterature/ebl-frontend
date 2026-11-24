import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { PeriodModifiers } from 'common/utils/period'
import { Periods } from 'common/utils/periodDefinitions'
import { Manuscript, ManuscriptTypes } from 'corpus/domain/manuscript'
import ManuscriptForm from 'corpus/ui/manuscripts/ManuscriptForm'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const manuscript = new Manuscript({
  id: 1,
  periodModifier: PeriodModifiers.None,
  period: Periods['Neo-Assyrian'],
  type: ManuscriptTypes.Library,
})
const onChange = jest.fn<void, [Manuscript]>()

function renderForm(): void {
  render(
    <ManuscriptForm
      manuscript={manuscript}
      provenanceOptions={[]}
      onChange={onChange}
      searchBibliography={jest.fn().mockResolvedValue([])}
    />,
  )
}

beforeEach(() => {
  onChange.mockClear()
})

it.each([
  ['periodModifier', 'Period modifier', 'Late', PeriodModifiers.Late],
  ['period', 'Period', 'Ur III', Periods['Ur III']],
  ['type', 'Type', 'School', ManuscriptTypes.School],
] as const)(
  'updates %s from its select',
  (property, label, value, expected) => {
    renderForm()
    fireEvent.change(screen.getByLabelText(label), { target: { value } })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0][property]).toEqual(expected)
  },
)
