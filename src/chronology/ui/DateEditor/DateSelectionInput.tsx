import React, { useState } from 'react'
import _ from 'lodash'
import { InputGroup, Form } from 'react-bootstrap'
import Select from 'react-select'
import {
  EponymDateField,
  KingDateField,
  Ur3Calendar,
} from 'chronology/domain/DateParameters'
import { KingField } from 'chronology/ui/Kings/Kings'
import { EponymField } from 'chronology/ui/DateEditor/Eponyms'
import getDateConfigs from 'chronology/application/DateSelectionInputConfig'
import {
  InputGroupProps,
  RadioButton,
  getBrokenAndUncertainSwitches,
} from 'chronology/ui/DateEditor/DateSelectionInputBase'

type InputGroupsProps = {
  yearValue: string
  yearBroken: boolean
  yearUncertain: boolean
  monthValue: string
  monthBroken: boolean
  monthUncertain: boolean
  isIntercalary?: boolean
  isAssyrianDate?: boolean
  dayValue: string
  dayBroken: boolean
  dayUncertain: boolean
  setYearValue: React.Dispatch<React.SetStateAction<string>>
  setYearBroken: React.Dispatch<React.SetStateAction<boolean>>
  setYearUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setMonthValue: React.Dispatch<React.SetStateAction<string>>
  setMonthBroken: React.Dispatch<React.SetStateAction<boolean>>
  setMonthUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setIntercalary?: React.Dispatch<React.SetStateAction<boolean>>
  setDayValue: React.Dispatch<React.SetStateAction<string>>
  setDayBroken: React.Dispatch<React.SetStateAction<boolean>>
  setDayUncertain: React.Dispatch<React.SetStateAction<boolean>>
}

export interface DateOptionsProps {
  king?: KingDateField
  kingBroken?: boolean
  kingUncertain?: boolean
  eponym?: EponymDateField
  eponymBroken?: boolean
  eponymUncertain?: boolean
  ur3Calendar?: Ur3Calendar
  isSeleucidEra: boolean
  isAssyrianDate: boolean
  isCalendarFieldDisplayed: boolean
  setKing: React.Dispatch<React.SetStateAction<KingDateField | undefined>>
  setKingBroken: React.Dispatch<React.SetStateAction<boolean>>
  setKingUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setEponym: React.Dispatch<React.SetStateAction<EponymDateField | undefined>>
  setEponymBroken: React.Dispatch<React.SetStateAction<boolean>>
  setEponymUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setIsSeleucidEra: React.Dispatch<React.SetStateAction<boolean>>
  setIsAssyrianDate: React.Dispatch<React.SetStateAction<boolean>>
  setIsCalenderFieldDisplayed: React.Dispatch<React.SetStateAction<boolean>>
  setUr3Calendar: React.Dispatch<React.SetStateAction<Ur3Calendar | undefined>>
}

export function DateOptionsInput(props: DateOptionsProps): JSX.Element {
  const [assyrianPhase, setAssyrianPhase] = useState(
    props?.eponym?.phase ?? 'NA'
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
  assyrianPhase?: 'NA' | 'MA' | 'OA'
): JSX.Element {
  return (
    <>
      {name === 'eponym' && assyrianPhase
        ? EponymField({ ...props, assyrianPhase })
        : KingField(props)}
      <InputGroup size="sm">
        {getBrokenAndUncertainSwitches({
          name,
          isBroken: props[`${name}Broken`] ?? false,
          isUncertain: props[`${name}Uncertain`] ?? false,
          setBroken: props[`set${_.capitalize(name)}Broken`],
          setUncertain: props[`set${_.capitalize(name)}Uncertain`],
        })}
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

function getAssyrianDateSwitch(props: {
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

function getUr3CalendarField({
  ur3Calendar,
  setUr3Calendar,
}: DateOptionsProps): JSX.Element {
  const options = Object.keys(Ur3Calendar).map((key) => {
    return { label: Ur3Calendar[key], value: key }
  })
  const value = options.find(
    (option) => option.label === ur3Calendar?.toString()
  )
  return (
    <Select
      aria-label="select-calendar"
      options={options}
      onChange={(option): void => {
        setUr3Calendar(Ur3Calendar[option?.value as keyof typeof Ur3Calendar])
      }}
      isSearchable={true}
      autoFocus={true}
      placeholder="Calendar"
      value={value}
    />
  )
}

function getDateInputGroup({
  name,
  value,
  isBroken,
  isUncertain,
  setValue,
  setBroken,
  setUncertain,
  isIntercalary = false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setIntercalary = (): void => {},
}: InputGroupProps): JSX.Element {
  return (
    <InputGroup size="sm">
      <Form.Control
        placeholder={_.startCase(name)}
        aria-label={_.startCase(name)}
        onChange={(event) => setValue(event.target.value)}
        value={value}
      />
      {name === 'month' && (
        <Form.Check
          label="Intercalary"
          id={`${name}_intercalary`}
          style={{ marginLeft: '10px' }}
          onChange={(event) => setIntercalary(event.target.checked)}
          checked={isIntercalary}
        />
      )}
      {getBrokenAndUncertainSwitches({
        name,
        isBroken,
        isUncertain,
        setBroken,
        setUncertain,
      })}
    </InputGroup>
  )
}

function getYearInputGroup(props: InputGroupsProps): JSX.Element {
  return getDateInputGroup({
    name: 'year',
    value: props.yearValue,
    isBroken: props.yearBroken,
    isUncertain: props.yearUncertain,
    setValue: props.setYearValue,
    setBroken: props.setYearBroken,
    setUncertain: props.setYearUncertain,
  })
}

function getMonthInputGroup(props: InputGroupsProps): JSX.Element {
  return getDateInputGroup({
    name: 'month',
    value: props.monthValue,
    isBroken: props.monthBroken,
    isUncertain: props.monthUncertain,
    isIntercalary: props.isIntercalary,
    setValue: props.setMonthValue,
    setBroken: props.setMonthBroken,
    setUncertain: props.setMonthUncertain,
    setIntercalary: props.setIntercalary,
  })
}

function getDayInputGroup(props: InputGroupsProps): JSX.Element {
  return getDateInputGroup({
    name: 'day',
    value: props.dayValue,
    isBroken: props.dayBroken,
    isUncertain: props.dayUncertain,
    setValue: props.setDayValue,
    setBroken: props.setDayBroken,
    setUncertain: props.setDayUncertain,
  })
}

export function DateInputGroups(props: InputGroupsProps): JSX.Element {
  return (
    <>
      {!props.isAssyrianDate && getYearInputGroup(props)}
      {getMonthInputGroup(props)}
      {getDayInputGroup(props)}
    </>
  )
}

export const exportedForTesting = { getUr3CalendarField, getAssyrianDateSwitch }
