import React, { useRef, useState } from 'react'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Fragment } from 'fragmentarium/domain/fragment'
import DateSelection, { DateEditor } from '../../application/DateSelection'
import { MetaAddButton } from 'fragmentarium/ui/info/MetaEditButton'
import ErrorAlert from 'common/errors/ErrorAlert'

interface Props {
  datesInText: readonly MesopotamianDate[]
  updateDatesInText: (
    datesInText: readonly MesopotamianDate[],
    signal?: AbortSignal,
  ) => Promise<Fragment>
}

interface DatesInTextSelectionAttrs {
  newDate: MesopotamianDate | undefined
  isAddDateEditorDisplayed: boolean
  isSaving: boolean
  datesInTextDisplay: readonly MesopotamianDate[]
  setIsAddDateEditorDisplayed: React.Dispatch<React.SetStateAction<boolean>>
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  saveError: Error | null
  setSaveError: React.Dispatch<React.SetStateAction<Error | null>>
  setNewDate: React.Dispatch<React.SetStateAction<MesopotamianDate | undefined>>
  setDatesInTextDisplay: React.Dispatch<
    React.SetStateAction<readonly MesopotamianDate[]>
  >
}

interface DatesInTextSelectionMethods {
  saveDates: (updatedDate?: MesopotamianDate, index?: number) => Promise<void>
  updateDateInArray: (
    date?: MesopotamianDate | undefined,
    index?: number,
    signal?: AbortSignal,
  ) => Promise<Fragment>
}

interface DatesInTextSelectionState
  extends DatesInTextSelectionAttrs, DatesInTextSelectionMethods {}

function updateDateInArray({
  updateDatesInText,
  datesInTextDisplay,
  date,
  index,
  signal,
}: {
  updateDatesInText: Props['updateDatesInText']
  datesInTextDisplay: DatesInTextSelectionAttrs['datesInTextDisplay']
  date?: MesopotamianDate | undefined
  index?: number
  signal?: AbortSignal
}): Promise<Fragment> {
  const updatedDatesInText = datesInTextDisplay.concat()
  if (index !== undefined && date !== undefined) {
    updatedDatesInText[index] = date
  } else if (index !== undefined) {
    updatedDatesInText.splice(index, 1)
  } else if (date !== undefined) {
    updatedDatesInText.push(date)
  }
  return updateDatesInText(updatedDatesInText, signal)
}

const saveDates = async ({
  updateDatesInText,
  datesInTextDisplay,
  setIsSaving,
  setSaveError,
  setDatesInTextDisplay,
  setIsAddDateEditorDisplayed,
  updatedDate,
  index,
}: {
  updateDatesInText: Props['updateDatesInText']
  datesInTextDisplay: DatesInTextSelectionAttrs['datesInTextDisplay']
  setIsSaving: DatesInTextSelectionAttrs['setIsSaving']
  setSaveError: DatesInTextSelectionAttrs['setSaveError']
  setDatesInTextDisplay: DatesInTextSelectionAttrs['setDatesInTextDisplay']
  setIsAddDateEditorDisplayed: DatesInTextSelectionAttrs['setIsAddDateEditorDisplayed']
  updatedDate?: MesopotamianDate
  index?: number
}): Promise<void> => {
  setIsSaving(true)
  setSaveError(null)
  try {
    const fragment = await updateDateInArray({
      updateDatesInText,
      datesInTextDisplay,
      date: updatedDate,
      index,
    })
    setDatesInTextDisplay(fragment.datesInText ?? [])
  } catch (error) {
    setSaveError(error as Error)
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
    undefined,
  )
  const [isAddDateEditorDisplayed, setIsAddDateEditorDisplayed] =
    useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<Error | null>(null)
  const [datesInTextDisplay, setDatesInTextDisplay] = useState(datesInText)

  const attrs = {
    newDate,
    isAddDateEditorDisplayed,
    isSaving,
    saveError,
    datesInTextDisplay,
    setIsAddDateEditorDisplayed,
    setIsSaving,
    setSaveError,
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
    updateDateInArray: (date, index, signal) =>
      updateDateInArray({ updateDatesInText, ...attrs, date, index, signal }),
  }
}

export default function DatesInTextSelection({
  datesInText = [],
  updateDatesInText,
}: Props): JSX.Element {
  const target = useRef(null)
  const state = useDateInTextSelectionState({ datesInText, updateDatesInText })

  const popover = (
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
  return (
    <>
      Dates in text:
      <MetaAddButton
        aria-label="Add date button"
        onClick={() => state.setIsAddDateEditorDisplayed(true)}
        buttonRef={target}
      />
      {popover}
      <ErrorAlert error={state.saveError} />
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
