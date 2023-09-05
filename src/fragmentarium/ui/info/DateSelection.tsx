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
  DateOptionsInput,
  DateInputGroups,
} from 'fragmentarium/ui/info/DateSelectionInput'
import { Eponym } from 'common/Eponyms'

type Props = {
  dateProp?: MesopotamianDate
  updateDate: (date?: MesopotamianDate, index?: number) => Bluebird<Fragment>
  inList?: boolean
  index?: number
  saveDateOverride?: (updatedDate?: MesopotamianDate, index?: number) => void
}

type DateEditorProps = {
  date?: MesopotamianDate
  updateDate: (date?: MesopotamianDate, index?: number) => Bluebird<Fragment>
  target: React.MutableRefObject<null>
  isSaving: boolean
  isDisplayed: boolean
  setDate: React.Dispatch<React.SetStateAction<MesopotamianDate | undefined>>
  setIsDisplayed: React.Dispatch<React.SetStateAction<boolean>>
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  index?: number
  saveDateOverride?: (updatedDate?: MesopotamianDate, index?: number) => void
}

export function DateEditor({
  date,
  setDate,
  updateDate,
  target,
  index,
  isDisplayed,
  isSaving,
  setIsDisplayed,
  setIsSaving,
  saveDateOverride,
}: DateEditorProps): JSX.Element {
  const [setUpdatePromise, cancelUpdatePromise] = usePromiseEffect<void>()
  const [isSeleucidEra, setIsSeleucidEra] = useState(
    date?.isSeleucidEra ?? false
  )
  const [isAssyrianDate, setIsAssyrianDate] = useState(
    date?.isAssyrianDate ?? false
  )
  const [isCalendarFieldDisplayed, setIsCalenderFieldDisplayed] = useState(
    date?.ur3Calendar ? true : false
  )
  const [king, setKing] = useState<King | undefined>(date?.king)
  const [eponym, setEponym] = useState<Eponym | undefined>(date?.eponym)
  const [ur3Calendar, setUr3Calendar] = useState<Ur3Calendar | undefined>(
    date?.ur3Calendar ?? undefined
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

  function getDate(): MesopotamianDate {
    return MesopotamianDate.fromJson({
      year: {
        value: isAssyrianDate ? '1' : yearValue,
        isBroken: isAssyrianDate ? undefined : yearBroken,
        isUncertain: isAssyrianDate ? undefined : yearUncertain,
      },
      month: {
        value: monthValue,
        isIntercalary,
        isBroken: monthBroken,
        isUncertain: monthUncertain,
      },
      day: { value: dayValue, isBroken: dayBroken, isUncertain: dayUncertain },
      king: king && !isSeleucidEra && !isAssyrianDate ? king : undefined,
      eponym: eponym && isAssyrianDate ? eponym : undefined,
      isSeleucidEra: isSeleucidEra,
      isAssyrianDate: isAssyrianDate,
      ur3Calendar:
        ur3Calendar && isCalendarFieldDisplayed ? ur3Calendar : undefined,
    })
  }

  const saveDateDefault = (updatedDate?: MesopotamianDate): void => {
    if (updatedDate !== date) {
      cancelUpdatePromise()
      setIsSaving(true)
      setUpdatePromise(
        updateDate(updatedDate, index)
          .then(() => {
            setIsDisplayed(false)
          })
          .then(() => setIsSaving(false))
          .then(() => setDate(updatedDate))
      )
    }
  }

  const saveDate = saveDateOverride ?? saveDateDefault

  const saveButton = (
    <Button
      className="m-1"
      disabled={false}
      onClick={() => saveDate(getDate(), index)}
    >
      Save
    </Button>
  )

  const deleteButton = (
    <Button
      className="m-1"
      variant="danger"
      disabled={false}
      onClick={() => saveDate(undefined, index)}
    >
      Delete
    </Button>
  )

  const dateOptionsInput = DateOptionsInput({
    king,
    eponym,
    isSeleucidEra,
    isAssyrianDate,
    isCalendarFieldDisplayed,
    ur3Calendar,
    setKing,
    setEponym,
    setIsSeleucidEra,
    setIsAssyrianDate,
    setIsCalenderFieldDisplayed,
    setUr3Calendar,
  })

  const dateInputGroups = DateInputGroups({
    yearValue,
    yearBroken,
    yearUncertain,
    monthValue,
    monthBroken,
    monthUncertain,
    isIntercalary,
    isAssyrianDate,
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
  })

  const popover = (
    <Popover
      style={{ maxWidth: '600px' }}
      id="popover-select-date"
      className={'w-100'}
    >
      <Popover.Content>
        {dateOptionsInput}
        {dateInputGroups}
        {date && deleteButton}
        {saveButton}
        <Spinner loading={isSaving}>Saving...</Spinner>
      </Popover.Content>
    </Popover>
  )

  return (
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
  )
}

export default function DateSelection({
  dateProp,
  updateDate,
  inList = false,
  index,
  saveDateOverride,
}: Props): JSX.Element {
  const target = useRef(null)
  const [isDisplayed, setIsDisplayed] = useState(false)
  const [date, setDate] = useState<MesopotamianDate | undefined>(dateProp)
  const [isSaving, setIsSaving] = useState(false)
  const editButton = (
    <SessionContext.Consumer>
      {(session: Session): ReactNode =>
        session.isAllowedToTransliterateFragments() && (
          <Button
            aria-label="Edit date button"
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

  const dateEditor = (
    <DateEditor
      updateDate={updateDate}
      target={target}
      isDisplayed={isDisplayed}
      isSaving={isSaving}
      setIsDisplayed={setIsDisplayed}
      setIsSaving={setIsSaving}
      date={date}
      setDate={setDate}
      index={index}
      saveDateOverride={saveDateOverride}
    />
  )

  return (
    <div>
      {!inList && 'Date: '}
      {editButton}
      {date ? <DateDisplay date={date} /> : inList ? '' : '-'}
      {dateEditor}
    </div>
  )
}
