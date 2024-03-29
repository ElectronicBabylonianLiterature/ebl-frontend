import React from 'react'

import _eponymsNeoAssyrian from 'chronology/domain/EponymsNeoAssyrian.json'
import _eponymsMiddleAssyrian from 'chronology/domain/EponymsMiddleAssyrian.json'
import _eponymsOldAssyrian from 'chronology/domain/EponymsOldAssyrian.json'
import Select from 'react-select'
import _ from 'lodash'
import { EponymDateField } from 'chronology/domain/DateParameters'

export interface Eponym {
  readonly date?: string
  readonly name?: string
  readonly title?: string
  readonly area?: string
  readonly event?: string
  readonly notes?: string
  readonly phase?: 'NA' | 'MA' | 'OA'
  readonly king?: string
  readonly isKing?: boolean
  readonly rel?: number
}

function getEponymsArray(array, phase: 'NA' | 'MA' | 'OA'): Eponym[] {
  return array.map((eponym) => {
    return { ...eponym, phase } as Eponym
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
  setEponym: React.Dispatch<React.SetStateAction<EponymDateField | undefined>>
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
