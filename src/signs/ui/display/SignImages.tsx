import SignService from 'signs/application/SignService'
import React, { useState } from 'react'
import withData, { WithoutData } from 'http/withData'
import { Col, Container, Image, Pagination, Row } from 'react-bootstrap'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'

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
    return <SignImages croppedAnnotations={data} />
  },
  (props) => props.signService.getImages(decodeURIComponent(props.signName))
)

function SignImages({
  croppedAnnotations,
}: {
  croppedAnnotations: CroppedAnnotation[]
}): JSX.Element {
  const [activePage, setActivePage] = useState(1)
  const chunks = _.chunk(croppedAnnotations, 13)
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

  const SignImage = ({
    croppedAnnotation,
  }: {
    croppedAnnotation: CroppedAnnotation
  }) => (
    <Col>
      <Col>
        <Image
          style={{ minWidth: '80px', maxHeight: '100px' }}
          src={`data:image/png;base64, ${croppedAnnotation.image}`}
        />
      </Col>
      <Col>
        <Link to={`/fragmentarium/${croppedAnnotation.fragmentNumber}`}>
          {croppedAnnotation.fragmentNumber}
        </Link>
        <div>
          {croppedAnnotation.label}&nbsp;({croppedAnnotation.script})
        </div>
      </Col>
    </Col>
  )
  const SignImagePage = ({ chunk }: { chunk: CroppedAnnotation[] }) => (
    <Row>
      {chunk.map((croppedAnnotation, index) => (
        <SignImage key={index} croppedAnnotation={croppedAnnotation} />
      ))}
    </Row>
  )

  return (
    <Container>
      <SignImagePage chunk={chunks[activePage - 1]} />
      <Row>
        <Col xs={{ offset: 5 }}>
          {' '}
          <Pagination>{items}</Pagination>
        </Col>
      </Row>
    </Container>
  )
}
