import React, { ReactNode, useRef, useState } from 'react'
import { MesopotamianDate } from 'chronology/domain/Date'
import Bluebird from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import DateSelection, { DateEditor } from './DateSelection'
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

interface DatesInTextSelectionState {
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
  saveDates: (updatedDate?: MesopotamianDate, index?: number) => Promise<void>
  updateDateInArray: (
    date?: MesopotamianDate | undefined,
    index?: number
  ) => Bluebird<Fragment>
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

  async function updateDateInArray(
    date?: MesopotamianDate | undefined,
    index?: number
  ): Bluebird<Fragment> {
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

  const saveDates = async (updatedDate?: MesopotamianDate, index?: number) => {
    setIsSaving(true)
    try {
      updateDateInArray(updatedDate, index).then((fragment) => {
        setDatesInTextDisplay(fragment.datesInText ?? [])
      })
    } finally {
      setIsAddDateEditorDisplayed(false)
      setIsSaving(false)
    }
  }

  return {
    newDate,
    isAddDateEditorDisplayed,
    isSaving,
    datesInTextDisplay,
    setIsAddDateEditorDisplayed,
    setIsSaving,
    setNewDate,
    setDatesInTextDisplay,
    saveDates,
    updateDateInArray,
  }
}

export default function DatesInTextSelection({
  datesInText = [],
  updateDatesInText,
}: Props): JSX.Element {
  const target = useRef(null)
  const {
    newDate,
    isAddDateEditorDisplayed,
    isSaving,
    datesInTextDisplay,
    setIsAddDateEditorDisplayed,
    setIsSaving,
    setNewDate,
    saveDates,
    updateDateInArray,
  } = useDateInTextSelectionState({ datesInText, updateDatesInText })

  const addDate = (
    <DateEditor
      date={newDate}
      updateDate={updateDateInArray}
      target={target}
      isDisplayed={isAddDateEditorDisplayed}
      isSaving={isSaving}
      setIsDisplayed={setIsAddDateEditorDisplayed}
      setIsSaving={setIsSaving}
      setDate={setNewDate}
      saveDateOverride={saveDates}
    />
  )

  const addButton = (
    <SessionContext.Consumer>
      {(session: Session): ReactNode =>
        session.isAllowedToTransliterateFragments() && (
          <Button
            aria-label="Add date button"
            variant="light"
            ref={target}
            className={classNames(['float-right', 'mh-100'])}
            onClick={() => {
              setIsAddDateEditorDisplayed(true)
            }}
          >
            <i
              className={classNames([
                'fas',
                'fa-plus',
                'fa-2xs',
                'float-right',
              ])}
            />
            {addDate}
          </Button>
        )
      }
    </SessionContext.Consumer>
  )

  return (
    <>
      Dates in text: {addButton}
      {datesInTextDisplay.map((date, index) => {
        return (
          <DateSelection
            dateProp={date}
            updateDate={updateDateInArray}
            key={`${index}_${date.toString()}`}
            inList={true}
            index={index}
            saveDateOverride={saveDates}
          />
        )
      })}
    </>
  )
}
