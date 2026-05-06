import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'

import './Statistics.css'

const statConfig = [
  { key: 'totalFragments', label: 'tablets indexed', icon: '𒀭' },
  {
    key: 'transliteratedFragments',
    label: 'tablets transliterated',
    icon: '𒁹',
  },
  { key: 'lines', label: 'lines of text', icon: '≡' },
]

function StatCard({
  value,
  label,
  icon,
}: {
  value: string
  label: string
  icon: string
}) {
  return (
    <div className="Statistics__card">
      <span className="Statistics__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="Statistics__value">{value}</span>
      <span className="Statistics__label">{label}</span>
    </div>
  )
}

function Statistics({ data }: { data: { readonly [key: string]: number } }) {
  const localized = _.mapValues(data, (v) => v.toLocaleString())
  return (
    <section className="Statistics">
      <h3 className="Statistics__heading">Current size of the Library</h3>
      <div className="Statistics__cards">
        {statConfig.map(({ key, label, icon }) => (
          <StatCard
            key={key}
            value={localized[key]}
            label={label}
            icon={icon}
          />
        ))}
      </div>
    </section>
  )
}

export default withData<
  unknown,
  { fragmentService },
  { readonly [key: string]: number }
>(Statistics, (props) => props.fragmentService.statistics())
