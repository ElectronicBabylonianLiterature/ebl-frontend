import Sign from 'signs/domain/Sign'
import { AnnotationToken } from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'
import { RawAnnotation } from 'fragmentarium/domain/annotation'
import React, { ReactElement, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import withData, { WithData } from 'http/withData'

type SubmitAnnotationButtonProps = {
  hoveringOverAnnotation?: boolean
  alreadySelected?: boolean
  setSignOfHoveringButton: (sign: Sign | undefined) => void
  sign: Sign | undefined
  token: AnnotationToken
  annotation: RawAnnotation
  onClick(annotation: RawAnnotation): void
  handleSelection(annotation: any): void
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
      sign={undefined}
      token={new AnnotationToken('blank', [-1], true)}
      annotation={annotation}
      onClick={onClick}
      handleSelection={handleSelection}
    />
  )
}

function SubmitAnnotationButton({
  hoveringOverAnnotation = false,
  alreadySelected = false,
  setSignOfHoveringButton,
  sign,
  token,
  annotation,
  onClick,
  handleSelection,
}: SubmitAnnotationButtonProps): ReactElement {
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (isHovering || hoveringOverAnnotation) {
      setSignOfHoveringButton(sign)
    }
  }, [isHovering, hoveringOverAnnotation])

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

export default withData<
  WithData<SubmitAnnotationButtonProps, Sign[]>,
  any,
  Sign[]
>(
  ({
    hoveringOverAnnotation,
    alreadySelected,
    setSignOfHoveringButton,
    data,
    token,
    annotation,
    onClick,
    handleSelection,
  }) => (
    <SubmitAnnotationButton
      hoveringOverAnnotation={hoveringOverAnnotation}
      alreadySelected={alreadySelected}
      setSignOfHoveringButton={setSignOfHoveringButton}
      sign={data.length ? data[0] : undefined}
      handleSelection={handleSelection}
      token={token}
      annotation={annotation}
      onClick={onClick}
    />
  ),
  (props) =>
    props.signService.search({
      value: props.token.reading.name,
      subIndex: props.token.reading.subIndex,
    })
)
