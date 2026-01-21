import React from 'react'
import _ from 'lodash'
import { Row, Col } from 'react-bootstrap'
import withData from 'http/withData'
import './DossiersSearch.sass'
import DossiersService from 'dossiers/application/DossiersService'
import { DossierRecordDisplay } from './DossiersDisplay'
import { DossierSearchResult } from 'dossiers/domain/DossierSearchResult'

function DossiersSearch({ data }: { data: DossierSearchResult }) {
  const { dossiers, totalCount } = data
  return (
    <div className="dossiers-search">
      {totalCount > 0 && (
        <p className="dossiers-search__total-count">
          Found {totalCount} dossier{totalCount !== 1 ? 's' : ''}
        </p>
      )}
      {dossiers.length === 0 ? (
        <p className="dossiers-search__no-results">No dossiers found</p>
      ) : (
        <ol className="dossiers-search__list">
          {dossiers.map((record, index) => (
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
  DossierSearchResult
>(
  DossiersSearch,
  (props) => props.dossiersService.search({ searchText: props.query }),
  {
    watch: (props) => [props.query],
    filter: (props) => !_.isEmpty(props.query),
    defaultData: () => ({ totalCount: 0, dossiers: [] }),
  },
)
