import React, { ReactNode, useRef, useState } from 'react'
import classNames from 'classnames'
import { Fragment } from 'fragmentarium/domain/fragment'
import { MesopotamianDate } from 'fragmentarium/domain/Date'
import { Session } from 'auth/Session'
import SessionContext from 'auth/SessionContext'
import { Button, Overlay, Popover } from 'react-bootstrap'
import Spinner from 'common/Spinner'
import { Ur3Calendar } from 'fragmentarium/domain/Date'
import { King } from 'common/BrinkmanKings'
import usePromiseEffect from 'common/usePromiseEffect'
import Bluebird from 'bluebird'
import DateDisplay from 'fragmentarium/ui/info/DateDisplay'
import {
  getKingInput,
  getDateInputGroups,
} from 'fragmentarium/ui/info/DateSelectionInput'

type Props = {
  fragment: Fragment
  updateDate: (date: MesopotamianDate) => Bluebird<Fragment>
}

export default function DateSelection({
  fragment,
  updateDate,
}: Props): JSX.Element {
  const [date, setDate] = useState<MesopotamianDate | undefined>(fragment?.date)
  const [setUpdatePromise, cancelUpdatePromise] = usePromiseEffect<void>()
  const [isSaving, setIsSaving] = useState(false)
  const [isDisplayed, setIsDisplayed] = useState(false)
  const [isSeleucidEra, setIsSeleucidEra] = useState(
    date?.isSeleucidEra ?? false
  )
  const [isCalendarFieldDisplayed, setIsCalenderFieldDisplayed] = useState(
    false
  )
  const [king, setKing] = useState<King | undefined>(date?.king)
  const [ur3Calendar, setUr3Calendar] = useState<Ur3Calendar | undefined>(
    undefined
  )
  const [yearValue, setYearValue] = useState(date?.year.value ?? '')
  const [yearBroken, setYearBroken] = useState(date?.year.isBroken ?? false)
  const [yearUncertain, setYearUncertain] = useState(
    date?.year.isUncertain ?? false
  )
  const [monthValue, setMonthValue] = useState(date?.month.value ?? '')
  const [isIntercalary, setIntercalary] = useState(
    date?.month.isIntercalary ?? false
  )
  const [monthBroken, setMonthBroken] = useState(date?.month.isBroken ?? false)
  const [monthUncertain, setMonthUncertain] = useState(
    date?.month.isUncertain ?? false
  )
  const [dayValue, setDayValue] = useState(date?.day.value ?? '')
  const [dayBroken, setDayBroken] = useState(date?.day.isBroken ?? false)
  const [dayUncertain, setDayUncertain] = useState(
    date?.day.isUncertain ?? false
  )
  const target = useRef(null)

  function getDate(): MesopotamianDate {
    return MesopotamianDate.fromJson({
      year: {
        value: yearValue,
        isBroken: yearBroken,
        isUncertain: yearUncertain,
      },
      month: {
        value: monthValue,
        isIntercalary,
        isBroken: monthBroken,
        isUncertain: monthUncertain,
      },
      day: { value: dayValue, isBroken: dayBroken, isUncertain: dayUncertain },
      king: king && !isSeleucidEra ? king : undefined,
      isSeleucidEra: isSeleucidEra,
      ur3Calendar:
        ur3Calendar && isCalendarFieldDisplayed ? ur3Calendar : undefined,
    })
  }

  const popover = (
    <Popover
      style={{ maxWidth: '600px' }}
      id="popover-select-date"
      className={'w-100'}
    >
      <Popover.Content>
        {getKingInput({
          date,
          isSeleucidEra,
          isCalendarFieldDisplayed,
          setKing,
          setIsSeleucidEra,
          setIsCalenderFieldDisplayed,
          setUr3Calendar,
        })}
        {getDateInputGroups({
          yearValue,
          yearBroken,
          yearUncertain,
          monthValue,
          monthBroken,
          monthUncertain,
          isIntercalary,
          dayValue,
          dayBroken,
          dayUncertain,
          setYearValue,
          setYearBroken,
          setYearUncertain,
          setMonthValue,
          setMonthBroken,
          setMonthUncertain,
          setIntercalary,
          setDayValue,
          setDayBroken,
          setDayUncertain,
        })}
        <Button
          className="m-1"
          disabled={false}
          onClick={() => {
            const updatedDate = getDate()
            if (updatedDate !== date) {
              cancelUpdatePromise()
              setIsSaving(true)
              setUpdatePromise(
                updateDate(updatedDate)
                  .then(() => setIsSaving(false))
                  .then(() => setIsDisplayed(false))
                  .then(() => setDate(updatedDate))
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
            }}
          />
        )
      }
    </SessionContext.Consumer>
  )

  return (
    <div>
      {session}
      Date: {date ? <DateDisplay date={date} /> : '-'}
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
