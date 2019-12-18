import React from 'react'
import { parse } from 'query-string'
import _ from 'lodash'

import AppContent from 'common/AppContent'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'
import withData from 'http/withData'
import SessionContext from 'auth/SessionContext'
import { Folio, Fragment } from 'fragmentarium/domain/fragment'
import { LinkContainer } from 'react-router-bootstrap'
import { Button } from 'react-bootstrap'
import { createFragmentUrl } from '../FragmentLink'

function AnnotateButton({ number }: { number: string }): JSX.Element {
  return (
    <LinkContainer to={`${createFragmentUrl(number)}/annotate`}>
      <Button variant="outline-primary">Annotate Fragment Image</Button>
    </LinkContainer>
  )
}

type Props = {
  fragmentService
  fragmentSearchService
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
}: {
  fragmentService
  fragmentSearchService
  match
  location
}) {
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
      title={
        <FragmentPager
          fragmentNumber={number}
          fragmentService={fragmentService}
        ></FragmentPager>
      }
      actions={<AnnotateButton number={number} />}
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
