import React from 'react'
import _ from 'lodash'
import { InputGroup, Form } from 'react-bootstrap'
import Select from 'react-select'
import BrinkmanKings from 'common/BrinkmanKings.json'
import { King } from 'common/BrinkmanKings'
import { MesopotamianDate } from 'fragmentarium/domain/Date'
import { Ur3Calendar } from 'fragmentarium/domain/Date'

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

type KingInputProps = {
  date: MesopotamianDate | undefined
  isSeleucidEra: boolean
  isCalendarFieldDisplayed: boolean
  ur3Calendar: Ur3Calendar | undefined
  setKing: React.Dispatch<React.SetStateAction<King | undefined>>
  setIsSeleucidEra: React.Dispatch<React.SetStateAction<boolean>>
  setIsCalenderFieldDisplayed: React.Dispatch<React.SetStateAction<boolean>>
  setUr3Calendar: React.Dispatch<React.SetStateAction<Ur3Calendar | undefined>>
}

const kingOptions = getKingOptions()

export function getKingInput(props: KingInputProps): JSX.Element {
  return (
    <>
      {getSeleucidSwitch(props)}
      {!props.isSeleucidEra && getKingField(props)}
      {props.isCalendarFieldDisplayed && getUr3CalendarField(props)}
    </>
  )
}

function getSeleucidSwitch({
  isSeleucidEra,
  setIsSeleucidEra,
  setIsCalenderFieldDisplayed,
}: KingInputProps): JSX.Element {
  return (
    <Form.Switch
      label="Seleucid Era"
      id="seleucid"
      style={{ marginLeft: '10px' }}
      onChange={(event): void => {
        setIsSeleucidEra(event.target.checked)
        if (event.target.checked) {
          setIsCalenderFieldDisplayed(false)
        }
      }}
      checked={isSeleucidEra}
    />
  )
}

function getKingField({
  date,
  setKing,
  setIsCalenderFieldDisplayed,
}: KingInputProps): JSX.Element {
  return (
    <Select
      aria-label="select-era"
      options={kingOptions}
      onChange={(option): void => {
        setKing(option?.value)
        if (option?.value?.dynastyNumber === '2') {
          setIsCalenderFieldDisplayed(true)
        } else {
          setIsCalenderFieldDisplayed(false)
        }
      }}
      isSearchable={true}
      autoFocus={true}
      placeholder="King"
      value={date ? getCurrentOption(date) : undefined}
    />
  )
}

function getKingSelectLabel(king: King): string {
  const kingYears = king.date ? ` (${king.date})` : ''
  return `${king.name}${kingYears}, ${king.dynastyName}`
}

function getKingOptions(): Array<{ label: string; value: King }> {
  return BrinkmanKings.filter(
    (king) => !['16', '17'].includes(king.dynastyNumber)
  ).map((king) => {
    return {
      label: getKingSelectLabel(king),
      value: king,
    }
  })
}

function getCurrentOption(
  date: MesopotamianDate
): { label: string; value: King } | undefined {
  return kingOptions.find((kingOption) =>
    _.isEqual(kingOption.value, date?.king)
  )
}

export function getUr3CalendarField({
  ur3Calendar,
  setUr3Calendar,
}: KingInputProps): JSX.Element {
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

export function getDateInputGroups(props: InputGroupsProps): JSX.Element {
  return (
    <>
      {getDateInputGroup({
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
