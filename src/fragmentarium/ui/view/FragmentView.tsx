import React from 'react'
import queryString from 'query-string'
import _ from 'lodash'

import AppContent from 'common/AppContent'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'
import withData from 'http/withData'
import SessionContext from 'auth/SessionContext'
import { Folio } from 'fragmentarium/domain/fragment'

const FragmentWithData = withData(
  ({ data, ...props }) => <CuneiformFragment fragment={data} {...props} />,
  props => props.fragmentService.find(props.number),
  {
    watch: props => [props.number]
  }
)

export default function FragmentView({
  match,
  location,
  fragmentService,
  fragmentSearchService
}) {
  const number = decodeURIComponent(match.params.id)
  const folioName = queryString.parse(location.search).folioName
  const folioNumber = queryString.parse(location.search).folioNumber
  const tab = queryString.parse(location.search).tab
  const activeFolio =
    folioName && folioNumber
      ? new Folio({
          name: _.isArray(folioName) ? folioName.join('') : folioName,
          number: _.isArray(folioNumber) ? folioNumber.join('') : folioNumber
        })
      : null

  return (
    <AppContent
      crumbs={['Fragmentarium', number]}
      title={<FragmentPager number={number}> {number} </FragmentPager>}
      wide
    >
      <SessionContext.Consumer>
        {session =>
          session.isAllowedToReadFragments() ? (
            <FragmentWithData
              number={number}
              fragmentService={fragmentService}
              fragmentSearchService={fragmentSearchService}
              activeFolio={activeFolio}
              tab={tab}
            />
          ) : (
            'Please log in to browse the Fragmentarium.'
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}
