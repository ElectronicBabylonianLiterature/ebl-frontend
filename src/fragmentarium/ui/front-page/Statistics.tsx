import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'

import './Statistics.css'

function StatRow({ value, label }: { value: string; label: string }) {
  return (
    <p className="Statistics__row">
      <span className="Statistics__value"> {value} </span> {label}
    </p>
  )
}

function Statistics({ data }: { data: { readonly [key: string]: number } }) {
  const localizedStatistics = _.mapValues(data, (value) =>
    value.toLocaleString(),
  )
  return (
    <section className="Statistics">
      <h3 className="SubsectionHeading--indented">
        Current size of the Library:
      </h3>
      <StatRow
        value={localizedStatistics.totalFragments}
        label="tablets indexed"
      />
      <StatRow
        value={localizedStatistics.transliteratedFragments}
        label="tablets transliterated"
      />
      <StatRow value={localizedStatistics.lines} label="lines of text" />
    </section>
  )
}

export default withData<
  unknown,
  { fragmentService },
  { readonly [key: string]: number }
>(Statistics, (props) => props.fragmentService.statistics())
