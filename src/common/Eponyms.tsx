import React from 'react'

import _eponymsNeoAssyrian from 'common/EponymsNeoAssyrian.json'
import _eponymsMiddleAssyrian from 'common/EponymsMiddleAssyrian.json'
import _eponymsOldAssyrian from 'common/EponymsOldAssyrian.json'
import Select from 'react-select'
import _ from 'lodash'

export interface Eponym {
  date?: string
  name?: string
  title?: string
  area?: string
  event?: string
  notes?: string
  phase?: 'NA' | 'MA' | 'OA'
}

export const eponymsNeoAssyrian = _eponymsNeoAssyrian.map((eponym) => {
  return { ...eponym, phase: 'NA' } as Eponym
})
export const eponymsMiddleAssyrian = _eponymsMiddleAssyrian.map((eponym) => {
  return { ...eponym, phase: 'MA' } as Eponym
})
export const eponymsOldAssyrian = _eponymsOldAssyrian.map((eponym) => {
  return { ...eponym, phase: 'OA' } as Eponym
})
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
