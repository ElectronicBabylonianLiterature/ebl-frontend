import React from 'react'

import _eponymsNeoAssyrian from 'common/EponymsNeoAssyrian.json'
import Select from 'react-select'
import _ from 'lodash'

export interface Eponym {
  date?: string
  name?: string
  title?: string
  area?: string
  event?: string
  notes?: string
}

export const EponymsNeoAssyrian = _eponymsNeoAssyrian as Eponym[]
const eponymOptions = getEponymsOptions()

export function getEponymField({
  eponym,
  setEponym,
}: {
  eponym?: Eponym
  setEponym: React.Dispatch<React.SetStateAction<Eponym | undefined>>
}): JSX.Element {
  return (
    <Select
      aria-label="select-eponym"
      options={eponymOptions}
      onChange={(option): void => {
        setEponym(option?.value)
      }}
      isSearchable={true}
      autoFocus={true}
      placeholder="Eponym"
      value={eponym ? getCurrentEponymOption(eponym) : undefined}
    />
  )
}

function getEponymSelectLabel(eponym: Eponym): string {
  const eponymYears = eponym.date ? ` (${eponym.date})` : ''
  return `${eponym.name}${eponymYears}`
}

function getEponymsOptions(): Array<{ label: string; value: Eponym }> {
  return EponymsNeoAssyrian.map((eponym) => {
    return {
      label: getEponymSelectLabel(eponym),
      value: eponym,
    }
  })
}

function getCurrentEponymOption(
  eponym?: Eponym
): { label: string; value: Eponym } | undefined {
  return eponymOptions.find((eponymOption) =>
    _.isEqual(eponymOption.value, eponym)
  )
}
