import React, { useState } from 'react'
import _ from 'lodash'
import { InputGroup, Form } from 'react-bootstrap'
import Select from 'react-select'
import { Ur3Calendar } from 'fragmentarium/domain/Date'
import { King, KingField } from 'common/BrinkmanKings'
import { Eponym, EponymField } from 'common/Eponyms'

type InputGroupProps = {
  name: string
  value: string
  isBroken: boolean
  isUncertain: boolean
  isIntercalary?: boolean
  setValue: React.Dispatch<React.SetStateAction<string>>
  setBroken: React.Dispatch<React.SetStateAction<boolean>>
  setUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setIntercalary?: React.Dispatch<React.SetStateAction<boolean>>
}

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

type DateOptionsProps = {
  king?: King
  eponym?: Eponym
  ur3Calendar?: Ur3Calendar
  isSeleucidEra: boolean
  isAssyrianDate: boolean
  isCalendarFieldDisplayed: boolean
  setKing: React.Dispatch<React.SetStateAction<King | undefined>>
  setEponym: React.Dispatch<React.SetStateAction<Eponym | undefined>>
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
      {!props.isSeleucidEra && !props.isAssyrianDate && KingField(props)}
      {props.isAssyrianDate && EponymField({ ...props, assyrianPhase })}
      {props.isCalendarFieldDisplayed && getUr3CalendarField(props)}
    </>
  )
}

type RadioButtonProps = {
  id: string
  label: string
  name: string
  checked: boolean
  onChange: () => void
}

const RadioButton = ({
  id,
  label,
  name,
  checked,
  onChange,
}: RadioButtonProps) => (
  <Form.Check
    inline
    type="radio"
    id={id}
    label={label}
    name={name}
    checked={checked}
    onChange={onChange}
  />
)

function getDateTypeSwitch(props: DateOptionsProps) {
  const dateConfigs = [
    {
      id: 'date-regular',
      label: 'Regular',
      checked: !props.isSeleucidEra && !props.isAssyrianDate,
      onChange: () => {
        props.setIsSeleucidEra(false)
        props.setIsAssyrianDate(false)
      },
    },
    {
      id: 'date-seleucid',
      label: 'Seleucid',
      checked: props.isSeleucidEra,
      onChange: () => {
        props.setIsSeleucidEra(true)
        props.setIsAssyrianDate(false)
        props.setIsCalenderFieldDisplayed(false)
      },
    },
    {
      id: 'date-assyrian',
      label: 'Assyrian',
      checked: props.isAssyrianDate,
      onChange: () => {
        props.setIsAssyrianDate(true)
        props.setIsSeleucidEra(false)
        props.setIsCalenderFieldDisplayed(false)
      },
    },
  ]

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
}) {
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
      <Form.Switch
        label={`${_.startCase(name)}-Broken`}
        id={`${name}_broken`}
        style={{ marginLeft: '10px' }}
        onChange={(event) => setBroken(event.target.checked)}
        checked={isBroken}
      />
      <Form.Switch
        label={`${_.startCase(name)}-Uncertain`}
        id={`${name}_uncertain`}
        style={{ marginLeft: '10px' }}
        onChange={(event) => setUncertain(event.target.checked)}
        checked={isUncertain}
      />
    </InputGroup>
  )
}

export function DateInputGroups(props: InputGroupsProps): JSX.Element {
  return (
    <>
      {!props.isAssyrianDate &&
        getDateInputGroup({
          name: 'year',
          value: props.yearValue,
          isBroken: props.yearBroken,
          isUncertain: props.yearUncertain,
          setValue: props.setYearValue,
          setBroken: props.setYearBroken,
          setUncertain: props.setYearUncertain,
        })}
      {getDateInputGroup({
        name: 'month',
        value: props.monthValue,
        isBroken: props.monthBroken,
        isUncertain: props.monthUncertain,
        isIntercalary: props.isIntercalary,
        setValue: props.setMonthValue,
        setBroken: props.setMonthBroken,
        setUncertain: props.setMonthUncertain,
        setIntercalary: props.setIntercalary,
      })}
      {getDateInputGroup({
        name: 'day',
        value: props.dayValue,
        isBroken: props.dayBroken,
        isUncertain: props.dayUncertain,
        setValue: props.setDayValue,
        setBroken: props.setDayBroken,
        setUncertain: props.setDayUncertain,
      })}
    </>
  )
}
