import React, { ReactNode, useRef, useState } from 'react'
import { MesopotamianDate } from 'chronology/domain/Date'
import Bluebird from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import DateSelection, { DateEditor } from '../application/DateSelection'
import { Session } from 'auth/Session'
import { Button } from 'react-bootstrap'
import SessionContext from 'auth/SessionContext'
import classNames from 'classnames'

interface Props {
  datesInText: readonly MesopotamianDate[]
  updateDatesInText: (
    datesInText: readonly MesopotamianDate[]
  ) => Bluebird<Fragment>
}

interface DatesInTextSelectionAttrs {
  newDate: MesopotamianDate | undefined
  isAddDateEditorDisplayed: boolean
  isSaving: boolean
  datesInTextDisplay: readonly MesopotamianDate[]
  setIsAddDateEditorDisplayed: React.Dispatch<React.SetStateAction<boolean>>
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  setNewDate: React.Dispatch<React.SetStateAction<MesopotamianDate | undefined>>
  setDatesInTextDisplay: React.Dispatch<
    React.SetStateAction<readonly MesopotamianDate[]>
  >
}

interface DatesInTextSelectionMethods {
  saveDates: (updatedDate?: MesopotamianDate, index?: number) => Promise<void>
  updateDateInArray: (
    date?: MesopotamianDate | undefined,
    index?: number
  ) => Bluebird<Fragment>
}

interface DatesInTextSelectionState
  extends DatesInTextSelectionAttrs,
    DatesInTextSelectionMethods {}

async function updateDateInArray({
  updateDatesInText,
  datesInTextDisplay,
  date,
  index,
}: {
  updateDatesInText: Props['updateDatesInText']
  datesInTextDisplay: DatesInTextSelectionAttrs['datesInTextDisplay']
  date?: MesopotamianDate | undefined
  index?: number
}): Bluebird<Fragment> {
  const updatedDatesInText = datesInTextDisplay.concat()
  if (index !== undefined && date !== undefined) {
    updatedDatesInText[index] = date
  } else if (index !== undefined) {
    updatedDatesInText.splice(index, 1)
  } else if (date !== undefined) {
    updatedDatesInText.push(date)
  }
  return updateDatesInText(updatedDatesInText)
}

const saveDates = async ({
  updateDatesInText,
  datesInTextDisplay,
  setIsSaving,
  setDatesInTextDisplay,
  setIsAddDateEditorDisplayed,
  updatedDate,
  index,
}: {
  updateDatesInText: Props['updateDatesInText']
  datesInTextDisplay: DatesInTextSelectionAttrs['datesInTextDisplay']
  setIsSaving: DatesInTextSelectionAttrs['setIsSaving']
  setDatesInTextDisplay: DatesInTextSelectionAttrs['setDatesInTextDisplay']
  setIsAddDateEditorDisplayed: DatesInTextSelectionAttrs['setIsAddDateEditorDisplayed']
  updatedDate?: MesopotamianDate
  index?: number
}) => {
  setIsSaving(true)
  try {
    updateDateInArray({
      updateDatesInText,
      datesInTextDisplay,
      date: updatedDate,
      index,
    }).then((fragment) => {
      setDatesInTextDisplay(fragment.datesInText ?? [])
    })
  } finally {
    setIsAddDateEditorDisplayed(false)
    setIsSaving(false)
  }
}

function useDateInTextSelectionState({
  datesInText,
  updateDatesInText,
}: Props): DatesInTextSelectionState {
  const [newDate, setNewDate] = useState<MesopotamianDate | undefined>(
    undefined
  )
  const [isAddDateEditorDisplayed, setIsAddDateEditorDisplayed] = useState(
    false
  )
  const [isSaving, setIsSaving] = useState(false)
  const [datesInTextDisplay, setDatesInTextDisplay] = useState(datesInText)

  const attrs = {
    newDate,
    isAddDateEditorDisplayed,
    isSaving,
    datesInTextDisplay,
    setIsAddDateEditorDisplayed,
    setIsSaving,
    setNewDate,
    setDatesInTextDisplay,
  }

  return {
    ...attrs,
    saveDates: (updatedDate, index) =>
      saveDates({
        updateDatesInText,
        ...attrs,
        updatedDate,
        index,
      }),
    updateDateInArray: (date, index) =>
      updateDateInArray({ updateDatesInText, ...attrs, date, index }),
  }
}

const getDateEditor = (
  target: React.MutableRefObject<null>,
  state: DatesInTextSelectionState
): JSX.Element => (
  <DateEditor
    date={state.newDate}
    updateDate={state.updateDateInArray}
    target={target}
    isDisplayed={state.isAddDateEditorDisplayed}
    isSaving={state.isSaving}
    setIsDisplayed={state.setIsAddDateEditorDisplayed}
    setIsSaving={state.setIsSaving}
    setDate={state.setNewDate}
    saveDateOverride={state.saveDates}
  />
)

const getAddButton = (
  target: React.MutableRefObject<null>,
  state: DatesInTextSelectionState
): JSX.Element => (
  <SessionContext.Consumer>
    {(session: Session): ReactNode =>
      session.isAllowedToTransliterateFragments() && (
        <Button
          aria-label="Add date button"
          variant="light"
          ref={target}
          className={classNames(['float-right', 'mh-100'])}
          onClick={() => {
            state.setIsAddDateEditorDisplayed(true)
          }}
        >
          <i
            className={classNames(['fas', 'fa-plus', 'fa-2xs', 'float-right'])}
          />
          {getDateEditor(target, state)}
        </Button>
      )
    }
  </SessionContext.Consumer>
)

export default function DatesInTextSelection({
  datesInText = [],
  updateDatesInText,
}: Props): JSX.Element {
  const target = useRef(null)
  const state = useDateInTextSelectionState({ datesInText, updateDatesInText })
  return (
    <>
      Dates in text: {getAddButton(target, state)}
      {state.datesInTextDisplay.map((date, index) => {
        return (
          <DateSelection
            dateProp={date}
            updateDate={state.updateDateInArray}
            key={`${index}_${date.toString()}`}
            inList={true}
            index={index}
            saveDateOverride={state.saveDates}
          />
        )
      })}
    </>
  )
}
