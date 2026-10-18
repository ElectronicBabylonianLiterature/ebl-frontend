import React, { useState } from 'react'
import _ from 'lodash'
import { InputGroup } from 'react-bootstrap'
import Select from 'react-select'
import { Ur3Calendar } from 'chronology/domain/DateParameters'
import { KingField } from 'chronology/ui/Kings/Kings'
import { EponymField } from 'chronology/ui/DateEditor/Eponyms'
import getDateConfigs from 'chronology/application/DateSelectionInputConfig'
import { DateOptionsProps } from 'chronology/application/DateOptionsProps'
import { RadioButton } from 'chronology/ui/DateEditor/DateSelectionInputBase'
import { BrokenAndUncertainSwitches } from 'common/ui/BrokenAndUncertain'

export function DateOptionsInput(props: DateOptionsProps): JSX.Element {
  const [assyrianPhase, setAssyrianPhase] = useState(
    props.eponym?.phase ?? 'NA',
  )
  return (
    <>
      {getDateTypeSwitch(props)}
      {props.isAssyrianDate &&
        getAssyrianDateSwitch({ assyrianPhase, setAssyrianPhase })}
      {!props.isSeleucidEra &&
        !props.isAssyrianDate &&
        getKingEponymSelect(props, 'king')}
      {props.isAssyrianDate &&
        getKingEponymSelect(props, 'eponym', assyrianPhase)}
      {props.isCalendarFieldDisplayed && getUr3CalendarField(props)}
    </>
  )
}

function getKingEponymSelect(
  props: DateOptionsProps,
  name: 'king' | 'eponym',
  assyrianPhase?: 'NA' | 'MA' | 'OA',
): JSX.Element {
  return (
    <>
      {name === 'eponym' && assyrianPhase
        ? EponymField({ ...props, assyrianPhase })
        : KingField(props)}
      <InputGroup size="sm">
        <BrokenAndUncertainSwitches
          {...{
            name,
            isBroken: props[`${name}Broken`] ?? false,
            isUncertain: props[`${name}Uncertain`] ?? false,
            setBroken: props[`set${_.capitalize(name)}Broken`],
            setUncertain: props[`set${_.capitalize(name)}Uncertain`],
          }}
        />
      </InputGroup>
      <br />
    </>
  )
}

function getDateTypeSwitch(props: DateOptionsProps): JSX.Element {
  const dateConfigs = getDateConfigs(props)
  return (
    <div key="inline-radio-date-type" className="mb-3">
      {dateConfigs.map((config) => (
        <RadioButton key={config.id} {...config} name="date-type" />
      ))}
    </div>
  )
}

export function getAssyrianDateSwitch(props: {
  assyrianPhase: 'NA' | 'MA' | 'OA'
  setAssyrianPhase: React.Dispatch<React.SetStateAction<'NA' | 'MA' | 'OA'>>
}): JSX.Element {
  const phases: ('NA' | 'MA' | 'OA')[] = ['NA', 'MA', 'OA']

  const assyrianConfigs = phases.map((phase) => ({
    id: `${phase.toLowerCase()}-assyrian-date`,
    label: `${
      phase === 'NA' ? 'Neo' : phase === 'MA' ? 'Middle' : 'Old'
    }-Assyrian`,
    checked: props.assyrianPhase === phase,
    onChange: () => props.setAssyrianPhase(phase),
  }))

  return (
    <div key="inline-radio-assyrian-phase" className="mb-3">
      {assyrianConfigs.map((config) => (
        <RadioButton key={config.id} {...config} name="assyrian-date" />
      ))}
    </div>
  )
}

export function getUr3CalendarField({
  ur3Calendar,
  setUr3Calendar,
}: DateOptionsProps): JSX.Element {
  const options = Object.keys(Ur3Calendar).map((key) => {
    return { label: Ur3Calendar[key], value: key }
  })
  const value = options.find(
    (option) => option.label === ur3Calendar?.toString(),
  )
  return (
    <Select
      aria-label="select-calendar"
      inputId="date-field-ur3-calendar"
      name="date-field-ur3-calendar"
      options={options}
      onChange={(option): void => {
        setUr3Calendar(Ur3Calendar[option?.value as keyof typeof Ur3Calendar])
      }}
      isSearchable={true}
      autoFocus={false}
      placeholder="Calendar"
      value={value}
    />
  )
}
