import { useCallback, useEffect, useState } from 'react'
import _ from 'lodash'
import Annotation from 'fragmentarium/domain/annotation'

const buttonY = 89
const buttonEscape = 27
const buttonShift = 16

export default function useAnnotationKeyboardShortcuts({
  reset,
  annotations,
  savedAnnotations,
  fragmentNumber,
}: {
  reset: () => void
  annotations: readonly Annotation[]
  savedAnnotations: readonly Annotation[]
  fragmentNumber: string
}): {
  isChangeExistingModeButtonPressed: boolean
  isDisableAnnotating: boolean
} {
  const [
    isChangeExistingModeButtonPressed,
    setIsChangeExistingModeButtonPressed,
  ] = useState(false)
  const [isDisableAnnotating, setIsDisableAnnotating] = useState(false)

  const onPressingDown = useCallback(
    (event) => {
      switch (event.keyCode) {
        case buttonEscape:
          reset()
          break
        case buttonY:
          setIsChangeExistingModeButtonPressed(true)
          break
        case buttonShift:
          setIsDisableAnnotating(true)
          break
        default:
          break
      }
    },
    [reset, setIsChangeExistingModeButtonPressed, setIsDisableAnnotating],
  )

  const onReleaseButton = useCallback(
    (event) => {
      if (event.keyCode === buttonY) {
        setIsChangeExistingModeButtonPressed(false)
      } else if (event.keyCode === buttonShift) {
        setIsDisableAnnotating(false)
      }
    },
    [setIsChangeExistingModeButtonPressed],
  )

  useEffect(() => {
    const alertUser = (event) => {
      if (!_.isEqual(savedAnnotations, annotations)) {
        event.preventDefault()
        return (event.returnValue = false)
      } else {
        return null
      }
    }

    window.addEventListener('beforeunload', alertUser, {
      capture: true,
      once: true,
    })
    document.addEventListener('keydown', onPressingDown, false)
    document.addEventListener('keyup', onReleaseButton, false)
    return () => {
      document.removeEventListener('keydown', onPressingDown, false)
      window.removeEventListener('beforeunload', alertUser)
      document.addEventListener('keyup', onReleaseButton, false)
    }
  }, [
    annotations,
    fragmentNumber,
    savedAnnotations,
    onPressingDown,
    onReleaseButton,
  ])

  return { isChangeExistingModeButtonPressed, isDisableAnnotating }
}
