import React, { Fragment } from 'react'
import classNames from 'classnames'
import FragmentLink from 'fragmentarium/FragmentLink'

const numberRegexp = /^([^\d]*)(\d+)$/

export default function FragmentPager({ number, children }) {
  const match = numberRegexp.exec(number)
  if (match) {
    const prefix = match[1]
    const current = Number(match[2] || 0)
    const PagerLink = ({ offset, label }) => (
      <FragmentLink number={`${prefix}${current + offset}`} aria-label={label}>
        <i
          className={classNames({
            fas: true,
            'fa-angle-left': offset < 0,
            'fa-angle-right': offset >= 0
          })}
          aria-hidden
        />
      </FragmentLink>
    )

    return (
      <Fragment>
        {current > 1 && <PagerLink offset={-1} label="Previous" />}
        {children}
        <PagerLink offset={1} label="Next" />
      </Fragment>
    )
  } else {
    return children
  }
}
