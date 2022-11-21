import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import { RawAnnotation } from 'fragmentarium/domain/annotation'
import React, { ReactElement, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'

type SubmitAnnotationButtonProps = {
  disabled: boolean
  isHoveringOverAnnotation?: boolean
  alreadySelected?: boolean
  setSignOfHoveringButton: (sign: string | null) => void
  token: AnnotationToken
  annotation: RawAnnotation
  onClick(annotation: RawAnnotation): void
  handleSelection(annotation: RawAnnotation): void
}

export function SubmitBlankAnnotationButton({
  disabled,
  isHoveringOverAnnotation,
  setSignOfHoveringButton,
  annotation,
  onClick,
  handleSelection,
}: Omit<SubmitAnnotationButtonProps, 'sign' | 'token'>): ReactElement {
  return (
    <SubmitAnnotationButton
      disabled={disabled}
      isHoveringOverAnnotation={isHoveringOverAnnotation}
      alreadySelected={false}
      setSignOfHoveringButton={setSignOfHoveringButton}
      token={AnnotationToken.blank()}
      annotation={annotation}
      onClick={onClick}
      handleSelection={handleSelection}
    />
  )
}
export function SubmitStructAnnotationButton({
  disabled,
  isHoveringOverAnnotation,
  setSignOfHoveringButton,
  annotation,
  onClick,
  handleSelection,
}: Omit<SubmitAnnotationButtonProps, 'sign' | 'token'>): ReactElement {
  return (
    <SubmitAnnotationButton
      disabled={disabled}
      isHoveringOverAnnotation={isHoveringOverAnnotation}
      alreadySelected={false}
      setSignOfHoveringButton={setSignOfHoveringButton}
      token={AnnotationToken.struct()}
      annotation={annotation}
      onClick={onClick}
      handleSelection={handleSelection}
    />
  )
}

export default function SubmitAnnotationButton({
  disabled,
  isHoveringOverAnnotation,
  alreadySelected,
  setSignOfHoveringButton,
  token,
  annotation,
  onClick,
  handleSelection,
}: SubmitAnnotationButtonProps): ReactElement {
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (isHovering || isHoveringOverAnnotation) {
      token.sign
        ? setSignOfHoveringButton(token.sign.displayCuneiformSigns)
        : setSignOfHoveringButton('No sign')
    }
  }, [
    isHovering,
    isHoveringOverAnnotation,
    setSignOfHoveringButton,
    token.sign,
  ])

  return (
    <Button
      disabled={alreadySelected || disabled}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      size="sm"
      variant={isHoveringOverAnnotation ? 'dark' : 'outline-dark'}
      onClick={(): void => {
        const newAnnotation = {
          ...annotation,
          data: {
            ...annotation.data,
            value: token.value,
            type: token.type,
            path: token.path,
            signName: token.sign ? token.sign.name : '',
          },
        }
        onClick(newAnnotation)
        handleSelection(newAnnotation)
      }}
    >
      {token.displayValue}
    </Button>
  )
}
