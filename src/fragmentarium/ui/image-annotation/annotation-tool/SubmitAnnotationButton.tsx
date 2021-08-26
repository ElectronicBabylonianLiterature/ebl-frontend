import Sign from 'signs/domain/Sign'
import { AnnotationToken } from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'
import { RawAnnotation } from 'fragmentarium/domain/annotation'
import React, { ReactElement, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'

type SubmitAnnotationButtonProps = {
  hoveringOverAnnotation?: boolean
  alreadySelected?: boolean
  setSignOfHoveringButton: (sign: Sign | undefined) => void
  token: AnnotationToken
  annotation: RawAnnotation
  onClick(annotation: RawAnnotation): void
  handleSelection(annotation: RawAnnotation): void
}

export function SubmitBlankAnnotationButton({
  hoveringOverAnnotation,
  setSignOfHoveringButton,
  annotation,
  onClick,
  handleSelection,
}: Omit<SubmitAnnotationButtonProps, 'sign' | 'token'>): ReactElement {
  return (
    <SubmitAnnotationButton
      hoveringOverAnnotation={hoveringOverAnnotation}
      setSignOfHoveringButton={setSignOfHoveringButton}
      token={new AnnotationToken('blank', [-1], true)}
      annotation={annotation}
      onClick={onClick}
      handleSelection={handleSelection}
    />
  )
}

export default function SubmitAnnotationButton({
  hoveringOverAnnotation = false,
  alreadySelected = false,
  setSignOfHoveringButton,
  token,
  annotation,
  onClick,
  handleSelection,
}: SubmitAnnotationButtonProps): ReactElement {
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (isHovering || hoveringOverAnnotation) {
      setSignOfHoveringButton(token.sign)
    }
  }, [isHovering, hoveringOverAnnotation, setSignOfHoveringButton, token.sign])

  return (
    <Button
      disabled={alreadySelected}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      size="sm"
      variant={hoveringOverAnnotation ? 'dark' : 'outline-dark'}
      onClick={(): void => {
        const newAnnotation = {
          ...annotation,
          data: {
            ...annotation.data,
            value: `${token.value}`,
            path: token.path,
            signName: token.sign ? token.sign.name : token.value,
          },
        }
        onClick(newAnnotation)
        handleSelection(newAnnotation)
      }}
    >
      {token.value}
    </Button>
  )
}
