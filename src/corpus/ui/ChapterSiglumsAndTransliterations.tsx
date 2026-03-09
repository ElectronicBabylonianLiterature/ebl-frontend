import React, { ReactNode } from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import { Transliteration } from 'transliteration/ui/Transliteration'
import SiglumAndTransliteration from 'corpus/domain/SiglumAndTransliteration'
import { Col, Container, Row } from 'react-bootstrap'
import { ChapterId } from 'transliteration/domain/chapter-id'

function SiglumsAndTansliterationsSection({
  name,
  data,
}: {
  name: ReactNode
  data: readonly SiglumAndTransliteration[]
}): JSX.Element {
  return (
    <section className="text-view__colophon-chapter">
      <h4 className="text-view__colophon-chapter-heading">Chapter {name}</h4>
      <Container bsPrefix="text-view__chapter-colophons">
        {data.map(({ siglum, text }) => (
          <Row key={siglum}>
            <Col md={2}>
              <h5 className="text-view__colophon-siglum">{siglum}</h5>
            </Col>
            <Col md={10}>
              <Transliteration text={text} />
            </Col>
          </Row>
        ))}
      </Container>
    </section>
  )
}

export default withData<
  { id: ChapterId },
  {
    textService
    method: 'findColophons' | 'findUnplacedLines'
  },
  readonly SiglumAndTransliteration[]
>(
  ({ data, id }) =>
    _.isEmpty(data) ? null : (
      <SiglumsAndTansliterationsSection name={id.name} data={data} />
    ),
  ({ id, textService, method }) => textService[method](id),
  {
    watch: (props) => [props.id],
  },
)
