import React from 'react'
import Select from 'react-select'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { Period, Periods } from 'common/period'
import _ from 'lodash'
import './ScriptSearchForm.sass'

function PeriodSelectionForm({
  periods,
  onChange,
}: {
  periods: readonly Period[]
  onChange: (value: string) => void
}): JSX.Element {
  const periodOptions = periods.map((period: Period) => ({
    value: period.name,
    label: period.name,
  }))

  return (
    <Select
      placeholder="Period"
      aria-label="select-period"
      options={periodOptions}
      onChange={(selection) => {
        onChange(selection?.value || '')
      }}
      isSearchable={true}
      className={'script-selection__selection'}
      classNamePrefix={'period-selector'}
      isClearable
    />
  )
}

export const PeriodSearchForm = withData<
  { onChange: (value: string) => void },
  { fragmentService: FragmentService },
  readonly string[]
>(
  ({ onChange, data }) => {
    const periods = _(Periods)
      .pick(['None', ...data])
      .values()
      .value() as readonly Period[]
    return <PeriodSelectionForm periods={periods} onChange={onChange} />
  },
  (props) => props.fragmentService.fetchPeriods()
)
