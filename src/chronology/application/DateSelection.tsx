import React, { ReactNode, useRef, useState } from 'react'
import classNames from 'classnames'
import { Fragment } from 'fragmentarium/domain/fragment'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Session } from 'auth/Session'
import SessionContext from 'auth/SessionContext'
import { Button, Overlay, Popover } from 'react-bootstrap'
import Spinner from 'common/Spinner'
import Bluebird from 'bluebird'
import DateDisplay from 'chronology/ui/DateDisplay'
import {
  DateOptionsInput,
  DateInputGroups,
} from 'chronology/ui/DateEditor/DateSelectionInput'
import useDateSelectionState, {
  DateEditorStateProps,
  DateSelectionState,
} from 'chronology/application/DateSelectionState'

type Props = {
  dateProp?: MesopotamianDate
  updateDate: (date?: MesopotamianDate, index?: number) => Bluebird<Fragment>
  inList?: boolean
  index?: number
  saveDateOverride?: (updatedDate?: MesopotamianDate, index?: number) => void
}

interface DateEditorProps extends DateEditorStateProps {
  target: React.MutableRefObject<null>
  isSaving: boolean
  isDisplayed: boolean
}

function getSelectedDateAndValidation(
  state: DateSelectionState,
  savedDate?: MesopotamianDate
): { selectedDate?: MesopotamianDate; isSelectedDateValid: boolean } {
  let isSelectedDateValid: boolean
  let selectedDate: MesopotamianDate | undefined
  try {
    selectedDate = state.getDate()
    const dateString = selectedDate.toString()
    const isDatesNotSame =
      savedDate === undefined || dateString !== savedDate.toString()
    const isDateEmpty = dateString.replaceAll('SE', '') !== ''
    const isAssyrianDateNotEmpty =
      !state.isAssyrianDate || dateString !== '∅.∅.1'
    isSelectedDateValid =
      isDateEmpty && isAssyrianDateNotEmpty && isDatesNotSame
  } catch {
    isSelectedDateValid = false
  }
  return { selectedDate, isSelectedDateValid }
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
  const state = useDateSelectionState({
    date,
    setDate,
    updateDate,
    index,
    setIsDisplayed,
    setIsSaving,
    saveDateOverride,
  })

  const dateOptionsInput = DateOptionsInput({ ...state })
  const dateInputGroups = DateInputGroups({ ...state })

  const deleteButton = (
    <Button
      className="m-1"
      variant="danger"
      disabled={false}
      onClick={() => state.saveDate(undefined, index)}
    >
      Delete
    </Button>
  )

  const { selectedDate, isSelectedDateValid } = getSelectedDateAndValidation(
    state,
    date
  )

  const saveButton = (
    <Button
      className="m-1"
      disabled={!isSelectedDateValid}
      onClick={() => state.saveDate(state.getDate(), index)}
    >
      Save
    </Button>
  )

  const savedDateDisplay = date ? (
    <>
      <b>Saved date</b>
      <DateDisplay date={date} />
    </>
  ) : (
    ''
  )
  const selectedDateDisplay =
    selectedDate && isSelectedDateValid ? (
      <>
        <b>Selected date</b>
        <DateDisplay date={selectedDate} />
      </>
    ) : (
      ''
    )

  const popover = (
    <Popover
      style={{ maxWidth: '600px' }}
      id="popover-select-date"
      className={'w-100'}
    >
      <Popover.Content>
        {dateOptionsInput}
        {dateInputGroups}
        {savedDateDisplay}
        {selectedDateDisplay}
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
