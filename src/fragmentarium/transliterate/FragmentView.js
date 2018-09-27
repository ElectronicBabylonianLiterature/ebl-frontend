import React from 'react'

import Breadcrumbs from 'Breadcrumbs'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'
import withData from 'http/withData'

const FragmentWithData = withData(
  ({ data, reload, ...props }) => <CuneiformFragment
    fragment={data}
    onChange={reload}
    {...props}
  />,
  props => props.fragmentRepository.find(props.number),
  {
    shouldUpdate: (prevProps, props) => prevProps.number !== props.number
  }
)

export default function FragmentView ({ auth, match, fragmentRepository, imageRepository }) {
  const number = match.params.id
  return (
    <section className='App-content App-content--wide'>
      <header>
        <Breadcrumbs section='Fragmentarium' active={number} />
        <h2><FragmentPager number={number}> {number} </FragmentPager></h2>
      </header>
      {auth.isAllowedTo('read:fragments')
        ? (
          <FragmentWithData auth={auth} number={number} fragmentRepository={fragmentRepository} imageRepository={imageRepository} />
        ) : 'You do not have the rights access the fragmentarium.'
      }
    </section>
  )
}
