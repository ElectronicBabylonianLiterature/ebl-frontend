import React, { ReactNode, useRef, useState } from 'react'
import classNames from 'classnames'
import { Fragment } from 'fragmentarium/domain/fragment'
import { MesopotamianDate } from 'fragmentarium/domain/Date'
import { Session } from 'auth/Session'
import SessionContext from 'auth/SessionContext'
import { Button, Overlay, Popover, InputGroup, Form } from 'react-bootstrap'
import Select from 'react-select'
import BrinkmanKings from 'common/BrinkmanKings.json'
import _ from 'lodash'
import Spinner from 'common/Spinner'
import { Ur3Calendar } from 'fragmentarium/domain/Date'
import { King } from 'common/BrinkmanKings'
//import withData from 'http/withData'
import usePromiseEffect from 'common/usePromiseEffect'
import Bluebird from 'bluebird'

/*
import React, { ReactNode, useEffect } from 'react'
import { usePrevious } from 'common/usePrevious'
*/

type Props = {
  fragment: Fragment
  updateDate: (date: MesopotamianDate) => Bluebird<Fragment>
}

export default function DateSelection({
  fragment,
  updateDate,
}: Props): JSX.Element {
  const [date, setDate] = useState<MesopotamianDate | undefined>(fragment.date)
  const [setUpdatePromise, cancelUpdatePromise] = usePromiseEffect<void>()
  const [isSaving, setIsSaving] = useState(false)
  const [isDisplayed, setIsDisplayed] = useState(false)
  const [isKingFieldDisplayed, setIsKingFieldDisplayed] = useState(
    date?.era !== 'seleucid'
  )
  const [isCalendarFieldDisplayed, setIsCalenderFieldDisplayed] = useState(
    false
  )
  const [king, setKing] = useState<King | undefined>(undefined)
  const [ur3Calendar, setUr3Calendar] = useState<Ur3Calendar | undefined>(
    undefined
  )
  const [year, setYear] = useState('')
  const [yearBroken, setYearBroken] = useState(false)
  const [yearUncertain, setyearUncertain] = useState(false)
  const [month, setMonth] = useState('')
  const [intercalary, setIntercalary] = useState(false)
  const [monthBroken, setMonthBroken] = useState(false)
  const [monthUncertain, setmonthUncertain] = useState(false)
  const [day, setDay] = useState('')
  const [dayBroken, setDayBroken] = useState(false)
  const [dayUncertain, setdayUncertain] = useState(false)
  const target = useRef(null)
  const kingOptions = getKingOptions()

  /*
  useEffect(() => {
    if (!_.isEqual(dates, prevDates) && !_.isNil(prevDates)) {
      updateDate(dates)
    }
  }, [dates, prevdates, updateDate])
  */

  function getDate(): MesopotamianDate {
    return MesopotamianDate.fromJson({
      era: !king && isKingFieldDisplayed ? 'seleucid' : king ?? '',
      year: { value: year, broken: yearBroken, uncertain: yearUncertain },
      month: {
        value: month,
        intercalary,
        broken: monthBroken,
        uncertain: monthUncertain,
      },
      day: { value: day, broken: dayBroken, uncertain: dayUncertain },
      ur3Calendar:
        ur3Calendar && isCalendarFieldDisplayed ? ur3Calendar : undefined,
    })
  }

  function getInputGroup(
    name: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    setBroken: React.Dispatch<React.SetStateAction<boolean>>,
    setUncertain: React.Dispatch<React.SetStateAction<boolean>>
  ): JSX.Element {
    return (
      <InputGroup size="sm">
        <Form.Control
          placeholder={_.startCase(name)}
          aria-label={_.startCase(name)}
          onChange={(event) => setValue(event.target.value)}
          value={date ? date[name]?.value : ''}
        />
        {name === 'month' && (
          <Form.Check
            label="Intercalary"
            id={`${name}_intercalary`}
            style={{ marginLeft: '10px' }}
            onChange={(event) => setIntercalary(event.target.checked)}
            checked={date?.month?.intercalary}
          />
        )}
        <Form.Switch
          label="Broken"
          id={`${name}_broken`}
          style={{ marginLeft: '10px' }}
          onChange={(event) => setBroken(event.target.checked)}
          checked={date ? date[name]?.broken : false}
        />
        <Form.Switch
          label="Uncertain"
          id={`${name}_uncertain`}
          style={{ marginLeft: '10px' }}
          onChange={(event) => setUncertain(event.target.checked)}
          checked={date ? date[name]?.uncertain : false}
        />
      </InputGroup>
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

  function getCurrentOption(): { label: string; value: King } | undefined {
    return kingOptions.find((kingOption) => kingOption.value === date?.era)
  }

  function getKingInput(): JSX.Element {
    return (
      <>
        <Form.Switch
          label="Seleucid Era"
          id="seleucid"
          style={{ marginLeft: '10px' }}
          onChange={(event): void => {
            setIsKingFieldDisplayed(!event.target.checked)
            if (event.target.checked) {
              setIsCalenderFieldDisplayed(false)
            }
          }}
        />
        {isKingFieldDisplayed && (
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
            value={getCurrentOption()}
          />
        )}
        {isCalendarFieldDisplayed && (
          <Select
            aria-label="select-calendar"
            options={Object.keys(Ur3Calendar).map((key) => {
              return { label: Ur3Calendar[key], value: key }
            })}
            onChange={(option): void => {
              setUr3Calendar(
                Ur3Calendar[option?.value as keyof typeof Ur3Calendar]
              )
            }}
            isSearchable={true}
            autoFocus={true}
            placeholder="Calendar"
          />
        )}
      </>
    )
  }

  const popover = (
    <Popover
      style={{ maxWidth: '600px' }}
      id="popover-select-date"
      className={'w-100'}
    >
      <Popover.Content>
        {getKingInput()}
        {getInputGroup('year', setYear, setYearBroken, setyearUncertain)}
        {getInputGroup('month', setMonth, setMonthBroken, setmonthUncertain)}
        {getInputGroup('day', setDay, setDayBroken, setdayUncertain)}
        <Button
          className="m-1"
          disabled={false /* ToDo: implement validation */}
          onClick={() => {
            const updatedDate = getDate()
            if (updatedDate !== date) {
              cancelUpdatePromise()
              setIsSaving(true)
              setUpdatePromise(
                updateDate(updatedDate)
                  .then(() => setIsSaving(false))
                  .then(() => setIsDisplayed(false))
                  .then(() => setDate(date))
              )
            }
          }}
        >
          Save
        </Button>
        <Spinner loading={isSaving}>Saving...</Spinner>
      </Popover.Content>
    </Popover>
  )

  const session = (
    <SessionContext.Consumer>
      {(session: Session): ReactNode =>
        session.isAllowedToTransliterateFragments() && (
          <Button
            aria-label="Browse dates button"
            variant="light"
            ref={target}
            className={classNames(['float-right', 'far fa-edit', 'mh-100'])}
            onClick={() => {
              setIsDisplayed(true)
              setIsKingFieldDisplayed(true)
            }}
          />
        )
      }
    </SessionContext.Consumer>
  )

  return (
    <div>
      {session}
      Date:
      <Overlay
        target={target.current}
        placement="right"
        show={isDisplayed}
        rootClose={true}
        rootCloseEvent={'click'}
        onHide={() => {
          setIsDisplayed(false)
        }}
      >
        {popover}
      </Overlay>
    </div>
  )
}

/*
export default withData<
  {
    fragment: Fragment
    updateDate: (date: MesopotamianDate) => Bluebird<Fragment>
  },
  { fragmentService },
  Date
>(
  ({ fragment, updateDate }) => {
    return <DateSelection fragment={fragment} updateDate={updateDate} />
  },
  (props) => props.fragmentService.fetchDate()
)
*/
