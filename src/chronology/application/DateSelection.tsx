import React, { useRef, useState } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { MesopotamianDate } from 'chronology/domain/Date'
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
import { MetaEditButton } from 'fragmentarium/ui/info/MetaEditButton'

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
  savedDate?: MesopotamianDate,
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
    date,
  )

  const saveButton = (
    <Button
      className="m-1"
      disabled={!isSelectedDateValid}
      onClick={() => state.saveDate(state.getDate(), index)}
      aria-label="Save date button"
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
      <Popover.Body>
        {dateOptionsInput}
        {dateInputGroups}
        {savedDateDisplay}
        {selectedDateDisplay}
        {date && deleteButton}
        {saveButton}
        <Spinner loading={isSaving}>Saving...</Spinner>
      </Popover.Body>
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

  return inList ? (
    <>
      {date && (
        <div className={'Details__inline-date'}>
          <DateDisplay date={date} />
          <MetaEditButton
            target={target}
            onClick={() => setIsDisplayed(true)}
            aria-label="Edit date button"
          />
        </div>
      )}
      {dateEditor}
    </>
  ) : (
    <div>
      {`Date:${date ? '' : ' -'}`}
      <MetaEditButton
        target={target}
        onClick={() => setIsDisplayed(true)}
        aria-label="Edit date button"
      />
      {date && <DateDisplay date={date} />}
      {dateEditor}
    </div>
  )
}
