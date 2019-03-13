import React from 'react'
import queryString from 'query-string'

import AppContent from 'common/AppContent'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'
import withData from 'http/withData'
import SessionContext from 'auth/SessionContext'
import { Folio } from 'fragmentarium/fragment'

const FragmentWithData = withData(
  ({ data, ...props }) => <CuneiformFragment
    fragment={data}
    {...props}
  />,
  props => props.fragmentService.find(props.number),
  {
    shouldUpdate: (prevProps, props) => prevProps.number !== props.number
  }
)

export default function FragmentView ({ match, location, fragmentService }) {
  const number = decodeURIComponent(match.params.id)
  const folioName = queryString.parse(location.search).folioName
  const folioNumber = queryString.parse(location.search).folioNumber
  const activeFolio = folioName || folioNumber
    ? new Folio({
      name: folioName,
      number: folioNumber
    })
    : null

  return (
    <AppContent
      section='Fragmentarium'
      active={number}
      title={<FragmentPager number={number}> {number} </FragmentPager>}
      wide>
      <SessionContext.Consumer>
        {session => session.isAllowedToReadFragments()
          ? <FragmentWithData number={number} fragmentService={fragmentService} activeFolio={activeFolio} />
          : 'Please log in to browse the Fragmentarium.'
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}
