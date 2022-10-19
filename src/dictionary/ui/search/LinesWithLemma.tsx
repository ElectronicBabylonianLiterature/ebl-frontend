import React from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { DictionaryLineDisplay } from 'corpus/domain/chapter'

import './LinesWithLemma.sass'
import { Col, Row } from 'react-bootstrap'
import LemmaLineTable from 'dictionary/ui/search/LemmaLineTable'

export default withData<
  { lemmaId: string },
  { lemmaId: string; genre?: string; textService: TextService },
  DictionaryLineDisplay[]
>(
  ({ data, lemmaId }): JSX.Element => {
    return (
      <Row>
        <Col>
          <LemmaLineTable lines={data} lemmaId={lemmaId} />
        </Col>
      </Row>
    )
  },
  (props) => props.textService.searchLemma(props.lemmaId, props.genre)
)
