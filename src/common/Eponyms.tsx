import React from 'react'

import _eponymsNeoAssyrian from 'common/EponymsNeoAssyrian.json'
import _eponymsMiddleAssyrian from 'common/EponymsMiddleAssyrian.json'
import _eponymsOldAssyrian from 'common/EponymsOldAssyrian.json'
import Select from 'react-select'
import _ from 'lodash'

export class Eponym {
  date?: string
  name?: string
  title?: string
  area?: string
  event?: string
  notes?: string
  phase?: 'NA' | 'MA' | 'OA'
  king?: string
  isKing?: boolean
  rel?: number
}

function getEponymsArray(array, phase: 'NA' | 'MA' | 'OA'): Eponym[] {
  return array.map((eponym) => {
    const reduced = new Eponym()
    return _.assign(
      reduced,
      _.pick({ ...eponym, phase }, _.keys(reduced))
    ) as Eponym
  })
}

export const eponymsNeoAssyrian = getEponymsArray(_eponymsNeoAssyrian, 'NA')
export const eponymsMiddleAssyrian = getEponymsArray(
  _eponymsMiddleAssyrian,
  'MA'
)
export const eponymsOldAssyrian = getEponymsArray(_eponymsOldAssyrian, 'OA')
const eponymOptions = getEponymsOptions()

export function EponymField({
  eponym,
  assyrianPhase,
  setEponym,
}: {
  eponym?: Eponym
  assyrianPhase: 'NA' | 'MA' | 'OA'
  setEponym: React.Dispatch<React.SetStateAction<Eponym | undefined>>
}): JSX.Element {
  return (
    <Select
      aria-label="select-eponym"
      options={eponymOptions.filter(
        (option) => option.value.phase === assyrianPhase
      )}
      onChange={(option): void => {
        setEponym(option?.value)
      }}
      isSearchable={true}
      autoFocus={true}
      placeholder="Eponym"
      value={
        eponym && eponym.phase === assyrianPhase
          ? getCurrentEponymOption(eponym)
          : null
      }
    />
  )
}

function getEponymSelectLabel(eponym: Eponym): string {
  const eponymYears = eponym.date ? ` (${eponym.date})` : ''
  return `${eponym.name}${eponymYears}`
}

function getEponymsOptions(): Array<{ label: string; value: Eponym }> {
  return [
    ...eponymsNeoAssyrian,
    ...eponymsMiddleAssyrian,
    ...eponymsOldAssyrian,
  ].map((eponym) => {
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
