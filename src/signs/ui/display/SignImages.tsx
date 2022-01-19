import SignService from 'signs/application/SignService'
import React, { useState } from 'react'
import withData, { WithoutData } from 'http/withData'
import { Col, Container, Figure, Pagination, Row } from 'react-bootstrap'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import './SignImages.css'

type Props = {
  signName: string
  data: CroppedAnnotation[]
  signService: SignService
}

export default withData<
  WithoutData<Props>,
  { signName: string; signService: SignService },
  CroppedAnnotation[]
>(
  ({ data }) => {
    return <SignImagePagination croppedAnnotations={data} />
  },
  (props) => props.signService.getImages(decodeURIComponent(props.signName))
)
function SignImage({
  croppedAnnotation,
}: {
  croppedAnnotation: CroppedAnnotation
}): JSX.Element {
  return (
    <Col>
      <Figure>
        <Figure.Image
          className={'signImages__signImage '}
          src={`data:image/png;base64, ${croppedAnnotation.image}`}
        />
        <Figure.Caption>
          <Link to={`/fragmentarium/${croppedAnnotation.fragmentNumber}`}>
            {croppedAnnotation.fragmentNumber}
          </Link>
          {croppedAnnotation.label}&nbsp;({croppedAnnotation.script})
        </Figure.Caption>
      </Figure>
    </Col>
  )
}

function SignImagePagination({
  croppedAnnotations,
}: {
  croppedAnnotations: CroppedAnnotation[]
}): JSX.Element {
  const [activePage, setActivePage] = useState(1)
  const chunks = _.chunk(croppedAnnotations, 16)
  const items = chunks.map((_, index) => {
    const paginationIndex = index + 1
    return (
      <Pagination.Item
        key={paginationIndex}
        active={paginationIndex === activePage}
        onClick={() => setActivePage(paginationIndex)}
      >
        {paginationIndex}
      </Pagination.Item>
    )
  })

  return (
    <Container>
      <Row>
        {chunks[activePage - 1].map((croppedAnnotation, index) => (
          <SignImage key={index} croppedAnnotation={croppedAnnotation} />
        ))}
      </Row>
      <Row>
        <Col xs={{ offset: 5 }}>
          <Pagination>{items}</Pagination>
        </Col>
      </Row>
    </Container>
  )
}
