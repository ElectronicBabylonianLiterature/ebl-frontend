import React from 'react'
import { parse } from 'query-string'
import _ from 'lodash'

import AppContent from 'common/AppContent'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'
import withData from 'http/withData'
import SessionContext from 'auth/SessionContext'
import { Folio, Fragment } from 'fragmentarium/domain/fragment'
import { RouteComponentProps } from 'react-router-dom';

type Props = {
  fragmentService
  fragmentSearchService,
  activeFolio: Folio | null | undefined
  tab: string | null | undefined
}
const FragmentWithData = withData<Props, { number: string }, Fragment>(
  ({ data, ...props }) => <CuneiformFragment fragment={data} {...props} />,
  props => props.fragmentService.find(props.number),
  {
    watch: props => [props.number]
  }
)

export default function FragmentView({
  fragmentService,
  fragmentSearchService,
  match,
  location
}: { fragmentService, fragmentSearchService } & RouteComponentProps) {
  const number = decodeURIComponent(match.params['id'])
  const folioName = parse(location.search).folioName
  const folioNumber = parse(location.search).folioNumber
  const tab = parse(location.search).tab
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
              tab={_.isArray(tab) ? tab.join('') : tab}
            />
          ) : (
            'Please log in to browse the Fragmentarium.'
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}
