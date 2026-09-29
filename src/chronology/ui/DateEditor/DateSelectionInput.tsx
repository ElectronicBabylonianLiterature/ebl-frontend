import DateFieldPatternsHelp from 'chronology/ui/DateEditor/DateFieldPatternsHelp'
import React from 'react'
import _ from 'lodash'
import { InputGroup, Form } from 'react-bootstrap'
import { InputGroupProps } from 'chronology/ui/DateEditor/DateSelectionInputBase'
import { BrokenAndUncertainSwitches } from 'common/ui/BrokenAndUncertain'
import getDateFieldWarnings from 'chronology/ui/DateEditor/dateFieldWarnings'
import {
  getAssyrianDateSwitch,
  getUr3CalendarField,
} from 'chronology/ui/DateEditor/DateOptionsInput'
import 'chronology/ui/DateEditor/DateSelectionInput.sass'

export { DateOptionsInput } from 'chronology/ui/DateEditor/DateOptionsInput'
export type { DateOptionsProps } from 'chronology/ui/DateEditor/DateOptionsInput'

type DateFieldName = 'year' | 'month' | 'day'

function DateFieldWarnings({
  field,
  value,
}: {
  field: DateFieldName
  value: string
}): JSX.Element {
  return (
    <>
      {getDateFieldWarnings(field, value).map((warning, index) => (
        <Form.Text
          key={`${field}-warning-${index}`}
          data-testid={`${field}-warning-${index}`}
          className="date-field-warning"
        >
          {warning}
        </Form.Text>
      ))}
    </>
  )
}

type InputGroupsProps = {
  yearValue: string
  yearBroken: boolean
  yearUncertain: boolean
  yearReconstructed?: boolean
  yearEmended?: boolean
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
  setYearReconstructed?: React.Dispatch<React.SetStateAction<boolean>>
  setYearEmended?: React.Dispatch<React.SetStateAction<boolean>>
  setMonthValue: React.Dispatch<React.SetStateAction<string>>
  setMonthBroken: React.Dispatch<React.SetStateAction<boolean>>
  setMonthUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setIntercalary?: React.Dispatch<React.SetStateAction<boolean>>
  setDayValue: React.Dispatch<React.SetStateAction<string>>
  setDayBroken: React.Dispatch<React.SetStateAction<boolean>>
  setDayUncertain: React.Dispatch<React.SetStateAction<boolean>>
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
  setIntercalary = (): void => {},
}: InputGroupProps): JSX.Element {
  return (
    <>
      <InputGroup size="sm" className="date-field-input-group">
        <Form.Control
          placeholder={_.startCase(name)}
          aria-label={_.startCase(name)}
          id={`date-field-${name}`}
          name={`date-field-${name}`}
          onChange={(event) => setValue(event.target.value)}
          value={value}
          className="date-field-input"
        />
        <BrokenAndUncertainSwitches
          {...{
            name,
            isBroken,
            isUncertain,
            setBroken,
            setUncertain,
          }}
        />
        {name === 'month' && (
          <Form.Check
            label="Intercalary"
            id={`${name}_intercalary`}
            onChange={(event) => setIntercalary(event.target.checked)}
            checked={isIntercalary}
          />
        )}
      </InputGroup>
      <DateFieldWarnings field={name as DateFieldName} value={value} />
    </>
  )
}

function getYearInputGroup(props: InputGroupsProps): JSX.Element {
  return (
    <>
      <InputGroup
        size="sm"
        className="date-field-input-group date-field-input-group--year"
      >
        <Form.Control
          placeholder={_.startCase('year')}
          aria-label={_.startCase('year')}
          id="date-field-year"
          name="date-field-year"
          onChange={(event) => props.setYearValue(event.target.value)}
          value={props.yearValue}
          className="date-field-input"
        />
        <BrokenAndUncertainSwitches
          name="year"
          isBroken={props.yearBroken}
          isUncertain={props.yearUncertain}
          setBroken={props.setYearBroken}
          setUncertain={props.setYearUncertain}
        />
        <div className="date-field-row-break" aria-hidden="true" />
        <div
          id="date-field-year-spacer"
          className="date-field-row-spacer"
          aria-hidden="true"
        />
        <Form.Switch
          label="Reconstructed"
          id="year_reconstructed"
          aria-label="0-year-reconstructed-switch"
          data-testid="0-year-reconstructed-switch"
          onChange={(event) =>
            props.setYearReconstructed?.(event.target.checked)
          }
          checked={Boolean(props.yearReconstructed)}
        />
        <Form.Switch
          label="Emended"
          id="year_emended"
          aria-label="0-year-emended-switch"
          data-testid="0-year-emended-switch"
          onChange={(event) => props.setYearEmended?.(event.target.checked)}
          checked={Boolean(props.yearEmended)}
        />
      </InputGroup>
      <DateFieldWarnings field="year" value={props.yearValue} />
    </>
  )
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
      <div className="date-field-patterns-help">
        <DateFieldPatternsHelp />
      </div>
      {!props.isAssyrianDate && getYearInputGroup(props)}
      {getMonthInputGroup(props)}
      {getDayInputGroup(props)}
    </>
  )
}

export const exportedForTesting = {
  getUr3CalendarField,
  getAssyrianDateSwitch,
  getDateFieldWarnings,
}
