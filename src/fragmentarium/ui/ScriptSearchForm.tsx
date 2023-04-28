import React from 'react'
import Select from 'react-select'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { Period, Periods, periodModifiers } from 'common/period'
import _ from 'lodash'
import './ScriptSearchForm.sass'
import { PeriodModifierString, PeriodString } from 'query/FragmentQuery'

function PeriodSelectionForm({
  periods,
  onChange,
  value,
}: {
  periods: readonly Period[]
  onChange: (value: PeriodString) => void
  value?: PeriodString
}): JSX.Element {
  const periodOptions = periods.map((period: Period) => ({
    value: period.name,
    label: period.name,
  }))
  const defaultOption = value ? { value: value, label: value } : null

  return (
    <Select
      placeholder="Period"
      aria-label="select-period"
      options={periodOptions}
      onChange={(selection) => {
        onChange(selection?.value || '')
      }}
      value={defaultOption}
      isSearchable={true}
      className={'script-selection__selection'}
      classNamePrefix={'period-selector'}
      isClearable
    />
  )
}

export const PeriodSearchForm = withData<
  {
    onChange: (value: PeriodString) => void
    value?: PeriodString
  },
  { fragmentService: FragmentService },
  readonly string[]
>(
  ({ onChange, value, data }) => {
    const periods = _(Periods)
      .pick(['None', ...data])
      .values()
      .value() as readonly Period[]
    return (
      <PeriodSelectionForm
        periods={periods}
        onChange={onChange}
        value={value}
      />
    )
  },
  (props) => props.fragmentService.fetchPeriods()
)

export function PeriodModifierSearchForm({
  onChange,
  value,
}: {
  onChange: (value: PeriodModifierString) => void
  value?: PeriodModifierString
}): JSX.Element {
  const modifiers = periodModifiers as readonly {
    name: PeriodModifierString
    displayName: string
  }[]
  const options = modifiers.map((modifier) => ({
    value: modifier.name,
    label: modifier.displayName,
  }))

  const defaultOption = value ? { value: value, label: value } : null
  return (
    <Select
      placeholder="Period modifier"
      aria-label="select-period-modifier"
      options={options}
      onChange={(selection) => {
        onChange(selection?.value || '')
      }}
      value={defaultOption}
      isSearchable={true}
      className={'script-selection__selection'}
      classNamePrefix={'period-selector'}
      isClearable
    />
  )
}
