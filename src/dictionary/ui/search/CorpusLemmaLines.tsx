import React from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { DictionaryLineDisplay } from 'corpus/domain/chapter'
import { genres } from 'corpus/ui/Corpus'

import './LinesWithLemma.sass'
import { Col, Row, Tab, Tabs } from 'react-bootstrap'
import LemmaLineTable from 'dictionary/ui/search/LemmaLineTable'
import _ from 'lodash'
import { EmptySection } from '../display/EmptySection'
import { CorpusQueryResult } from 'query/QueryResult'
import LemmaQueryLink from '../display/LemmaQueryLink'

const CorpusLines = withData<
  { lemmaId: string },
  { lemmaId: string; genre?: string; textService: TextService },
  DictionaryLineDisplay[]
>(
  ({ data, lemmaId }): JSX.Element => {
    const dataByGenre = _.groupBy(data, (line) => line.textId.genre)

    return _.isEmpty(data) ? (
      <EmptySection />
    ) : (
      <Tabs defaultActiveKey={genres[0].genre} key="corpus">
        {genres.map(({ genre, name }, index) => (
          <Tab
            eventKey={genre}
            title={name}
            key={index}
            disabled={!(genre in dataByGenre)}
          >
            <Row>
              <Col>
                <LemmaLineTable lines={dataByGenre[genre]} lemmaId={lemmaId} />
              </Col>
            </Row>
          </Tab>
        ))}
      </Tabs>
    )
  },
  (props) => props.textService.searchLemma(props.lemmaId, props.genre),
)

export default withData<
  { lemmaId: string; textService: TextService },
  { textService: TextService },
  CorpusQueryResult
>(
  ({ data, textService, lemmaId }): JSX.Element => {
    const total = data.matchCountTotal.toLocaleString()
    const hasMatches = data.matchCountTotal > 0
    return (
      <>
        <p>
          {total} matches&nbsp;
          {hasMatches && (
            <LemmaQueryLink lemmaId={lemmaId} anchor={'#corpus'} />
          )}
        </p>
        <CorpusLines textService={textService} lemmaId={lemmaId} />
        {hasMatches && (
          <p>
            <LemmaQueryLink lemmaId={lemmaId} anchor={'#corpus'}>
              Show all {total} matches in Corpus search&nbsp;
            </LemmaQueryLink>
          </p>
        )}
      </>
    )
  },
  ({ textService, lemmaId }) => textService.query({ lemmas: lemmaId }),
)
