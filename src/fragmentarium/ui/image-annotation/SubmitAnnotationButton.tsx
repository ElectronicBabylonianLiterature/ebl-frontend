import Sign from 'signs/domain/Sign'
import { AnnotationToken } from 'fragmentarium/ui/image-annotation/annotation-token'
import { RawAnnotation } from 'fragmentarium/domain/annotation'
import React, { ReactElement, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import withData, { WithData } from 'http/withData'
import { parseValue } from 'signs/ui/search/SignsSearchForm'

type SubmitAnnotationButtonProps = {
  setHoveringReading: (sign: Sign | undefined) => void
  sign: Sign | undefined
  token: AnnotationToken
  annotation: RawAnnotation
  onClick(annotation: RawAnnotation): void
  handleSelection(annotation: any): void
}

export function SubmitAnnotationButton({
  setHoveringReading,
  sign,
  token,
  annotation,
  onClick,
  handleSelection,
}: SubmitAnnotationButtonProps): ReactElement {
  const [inHover, setHover] = useState(false)
  useEffect(() => {
    if (inHover) {
      setHoveringReading(sign)
    }
  }, [inHover])

  return (
    <Button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      size="sm"
      variant={token.hasMatchingPath(annotation) ? 'dark' : 'outline-dark'}
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
    setHoveringReading,
    data,
    token,
    annotation,
    onClick,
    handleSelection,
  }) => (
    <SubmitAnnotationButton
      setHoveringReading={setHoveringReading}
      sign={data.length ? data[0] : undefined}
      handleSelection={handleSelection}
      token={token}
      annotation={annotation}
      onClick={onClick}
    />
  ),
  (props) => props.signService.search(parseValue(props.token.cleanValue))
)
