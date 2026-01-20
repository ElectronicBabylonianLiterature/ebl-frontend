import React from 'react'
import _ from 'lodash'
import { Row, Col } from 'react-bootstrap'
import withData from 'http/withData'
import './DossiersSearch.sass'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'
import { DossierRecordDisplay } from './DossiersDisplay'

function DossiersSearch({ data }: { data: readonly DossierRecord[] }) {
  return (
    <div className="dossiers-search">
      {data.length === 0 ? (
        <p className="dossiers-search__no-results">No dossiers found</p>
      ) : (
        <ol className="dossiers-search__list">
          {data.map((record, index) => (
            <li key={record.id} className="dossiers-search__entry">
              <Row className="dossiers-search__row">
                <Col md={12}>
                  <DossierRecordDisplay record={record} index={index} />
                </Col>
              </Row>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default withData<
  unknown,
  {
    dossiersService: DossiersService
    query: string
  },
  readonly DossierRecord[]
>(
  DossiersSearch,
  (props) => props.dossiersService.search({ searchText: props.query }),
  {
    watch: (props) => [props.query],
    filter: (props) => !_.isEmpty(props.query),
    defaultData: () => [],
  }
)
