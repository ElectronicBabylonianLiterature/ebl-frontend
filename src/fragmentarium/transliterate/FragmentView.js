import React from 'react'

import Breadcrumbs from 'common/Breadcrumbs'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'
import withData from 'http/withData'

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

export default function FragmentView ({ match, fragmentService }) {
  const number = match.params.id
  return (
    <section className='App-content App-content--wide'>
      <header>
        <Breadcrumbs section='Fragmentarium' active={number} />
        <h2><FragmentPager number={number}> {number} </FragmentPager></h2>
      </header>
      {fragmentService.isAllowedToRead()
        ? (
          <FragmentWithData number={number} fragmentService={fragmentService} />
        ) : 'You do not have the rights access the fragmentarium.'
      }
    </section>
  )
}
