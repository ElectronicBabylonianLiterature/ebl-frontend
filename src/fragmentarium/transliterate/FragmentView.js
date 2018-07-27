import React from 'react'

import Breadcrumbs from 'Breadcrumbs'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'
import withData from 'http/withData'

const FragmentWithData = withData(
  ({data, reload, apiClient}) => <CuneiformFragment
    fragment={data}
    apiClient={apiClient}
    onChange={reload}
  />,
  props => `/fragments/${props.number}`,
  {
    shouldUpdate: (prevProps, props) => prevProps.number !== props.number
  }
)

export default function FragmentView ({apiClient, auth, match}) {
  const number = match.params.id
  return (
    <section className='App-content App-content--wide'>
      <header>
        <Breadcrumbs section='Fragmentarium' active={number} />
        <h2><FragmentPager number={number}> {number} </FragmentPager></h2>
      </header>
      {auth.isAuthenticated()
        ? (
          <FragmentWithData apiClient={apiClient} number={number} />
        ) : 'You need to be logged in to access the fragmentarium.'
      }
    </section>
  )
}
