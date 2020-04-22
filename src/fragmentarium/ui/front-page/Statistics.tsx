import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'

import './Statistics.css'

function Statistics({ data }) {
  const localizedStatistics = _.mapValues(data, (value) =>
    value.toLocaleString()
  )

  return (
    <section className="Statistics">
      <h3 className="SubsectionHeading--indented">
        Current size of the corpus:
      </h3>
      <p className="Statistics__row">
        <span className="Statistics__value">
          {' '}
          {localizedStatistics.transliteratedFragments}{' '}
        </span>{' '}
        tablets transliterated
      </p>
      <p className="Statistics__row">
        <span className="Statistics__value"> {localizedStatistics.lines} </span>{' '}
        lines of text
      </p>
    </section>
  )
}

export default withData<
  {},
  { fragmentService },
  { readonly [key: string]: number }
>(Statistics, (props) => props.fragmentService.statistics())
