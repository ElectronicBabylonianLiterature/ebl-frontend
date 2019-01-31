import React from 'react'
import queryString from 'query-string'

import Breadcrumbs from 'common/Breadcrumbs'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'
import withData from 'http/withData'
import SessionContext from 'auth/SessionContext'

const FragmentWithData = withData(
  ({ data, reload, ...props }) => <CuneiformFragment
    fragment={data}
    onChange={reload}
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
    ? {
      name: folioName,
      number: folioNumber
    }
    : null

  return (
    <section className='App-content App-content--wide'>
      <header>
        <Breadcrumbs section='Fragmentarium' active={number} />
        <h2><FragmentPager number={number}> {number} </FragmentPager></h2>
      </header>
      <SessionContext.Consumer>
        {session => session.isAllowedToReadFragments()
          ? <FragmentWithData number={number} fragmentService={fragmentService} activeFolio={activeFolio} />
          : 'Please log in to browse the Fragmentarium.'
        }
      </SessionContext.Consumer>
    </section>
  )
}
