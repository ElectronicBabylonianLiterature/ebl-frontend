import React, { useRef, useState } from 'react'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Fragment } from 'fragmentarium/domain/fragment'
import DateSelection, { DateEditor } from 'chronology/application/DateSelection'
import { MetaAddButton } from 'fragmentarium/ui/info/MetaEditButton'
import ErrorAlert from 'common/errors/ErrorAlert'
import usePromiseEffect, {
  RunWriteOperation,
} from 'common/hooks/usePromiseEffect'
import applyWhenCurrent from 'common/utils/applyWhenCurrent'

interface Props {
  datesInText: readonly MesopotamianDate[]
  updateDatesInText: (
    datesInText: readonly MesopotamianDate[],
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
  ) => Promise<Fragment>
}

interface DatesInTextSelectionState
  extends DatesInTextSelectionAttrs, DatesInTextSelectionMethods {}

function updateDateInArray({
  updateDatesInText,
  datesInTextDisplay,
  date,
  index,
}: {
  updateDatesInText: Props['updateDatesInText']
  datesInTextDisplay: DatesInTextSelectionAttrs['datesInTextDisplay']
  date?: MesopotamianDate | undefined
  index?: number
}): Promise<Fragment> {
  const replacement = date === undefined ? [] : [date]
  if (index === undefined) {
    return updateDatesInText([...datesInTextDisplay, ...replacement])
  }
  const updatedDatesInText = datesInTextDisplay.concat()
  updatedDatesInText.splice(index, 1, ...replacement)
  return updateDatesInText(updatedDatesInText)
}

const saveDates = ({
  updateDate,
  setIsSaving,
  setSaveError,
  setDatesInTextDisplay,
  setIsAddDateEditorDisplayed,
  runWrite,
  updatedDate,
  index,
}: {
  updateDate: DatesInTextSelectionMethods['updateDateInArray']
  setIsSaving: DatesInTextSelectionAttrs['setIsSaving']
  setSaveError: DatesInTextSelectionAttrs['setSaveError']
  setDatesInTextDisplay: DatesInTextSelectionAttrs['setDatesInTextDisplay']
  setIsAddDateEditorDisplayed: DatesInTextSelectionAttrs['setIsAddDateEditorDisplayed']
  runWrite: RunWriteOperation
  updatedDate?: MesopotamianDate
  index?: number
}): Promise<void> => {
  const finishSaving = (): void => {
    setIsAddDateEditorDisplayed(false)
    setIsSaving(false)
  }
  setIsSaving(true)
  setSaveError(null)
  return runWrite(
    applyWhenCurrent(() => updateDate(updatedDate, index), {
      onSuccess: (fragment) => {
        setDatesInTextDisplay(fragment.datesInText ?? [])
        finishSaving()
      },
      onError: (error) => {
        setSaveError(error)
        finishSaving()
      },
    }),
  )
}

function useDateInTextSelectionState({
  datesInText,
  updateDatesInText,
}: Props): DatesInTextSelectionState {
  const [, , runWrite] = usePromiseEffect()
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

  const updateDate: DatesInTextSelectionMethods['updateDateInArray'] = (
    date,
    index,
  ) => updateDateInArray({ updateDatesInText, datesInTextDisplay, date, index })

  return {
    ...attrs,
    saveDates: (updatedDate, index) =>
      saveDates({ ...attrs, updateDate, runWrite, updatedDate, index }),
    updateDateInArray: updateDate,
  }
}

export default function DatesInTextSelection({
  datesInText,
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
        disabled={state.isSaving}
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
            isParentSaving={state.isSaving}
          />
        )
      })}
    </>
  )
}
