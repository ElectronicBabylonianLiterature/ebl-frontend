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
} from 'chronology/application/DateSelectionState'
import KingsService from './KingsService'

type Props = {
  dateProp?: MesopotamianDate
  updateDate: (date?: MesopotamianDate, index?: number) => Bluebird<Fragment>
  inList?: boolean
  index?: number
  saveDateOverride?: (updatedDate?: MesopotamianDate, index?: number) => void
  kingsService: KingsService
}

interface DateEditorProps extends DateEditorStateProps {
  target: React.MutableRefObject<null>
  isSaving: boolean
  isDisplayed: boolean
  kingsService: KingsService
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
  kingsService,
}: DateEditorProps): JSX.Element {
  const state = useDateSelectionState({
    date,
    setDate,
    updateDate,
    index,
    setIsDisplayed,
    setIsSaving,
    saveDateOverride,
    kingsService,
  })

  const dateOptionsInput = DateOptionsInput({ ...state })
  const dateInputGroups = DateInputGroups({ ...state })

  const saveButton = (
    <Button
      className="m-1"
      disabled={false}
      onClick={() => state.saveDate(state.getDate(), index)}
    >
      Save
    </Button>
  )

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
  kingsService,
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
      kingsService={kingsService}
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
