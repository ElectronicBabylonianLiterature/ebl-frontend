import SignService from 'signs/application/SignService'
import React, { useState } from 'react'
import withData, { WithoutData } from 'http/withData'
import { Col, Container, Image, Pagination, Row } from 'react-bootstrap'
import _ from 'lodash'
import { Link } from 'react-router-dom'

type Props = {
  signName: string
  data: Blob[]
  signService: SignService
}

export default withData<
  WithoutData<Props>,
  { signName: string; signService: SignService },
  Blob[]
>(
  ({ data }) => {
    return <SignImages images={data} />
  },
  (props) => props.signService.getImages(decodeURIComponent(props.signName))
)

function SignImages({ images }: { images: any }): JSX.Element {
  const [activePage, setActivePage] = useState(1)
  const chunks = _.chunk(images, 15)
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
    base64,
    fragmentNumber = 'K.19461',
    description = "3' (NB)",
  }: {
    base64: string
    fragmentNumber?: string
    description?: string
  }) => (
    <Col>
      <Col>
        <Image src={`data:image/png;base64, ${base64}`} fluid />
      </Col>
      <Col>
        <Link to={`/fragmentarium/${fragmentNumber}`}>{fragmentNumber}</Link>
        &nbsp;{description}
      </Col>
    </Col>
  )
  const Total = ({ chunk }: { chunk: any }) => (
    <Row>
      {chunk.map((image, index) => (
        <SignImage key={index} base64={image} />
      ))}
    </Row>
  )

  return (
    <Container>
      <Total chunk={chunks[activePage - 1]} />
      <Row>
        <Col xs={{ offset: 5 }}>
          {' '}
          <Pagination>{items}</Pagination>
        </Col>
      </Row>
    </Container>
  )
}
