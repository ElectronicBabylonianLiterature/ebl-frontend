import React from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

import './FragmentPager.css'

const numberRegexp = /^([^\d]*)(\d+)$/

export default function FragmentPager ({number}) {
  const match = numberRegexp.exec(number)
  if (match) {
    const prefix = match[1]
    const current = Number(match[2] || 0)
    const PagerLink = ({offset, label}) => (
      <Link to={`/fragmentarium/${prefix}${current + offset}`} aria-label={label}>
        <i className={classNames({
          fas: true,
          'fa-angle-left': offset < 0,
          'fa-angle-right': offset >= 0
        })} aria-hidden />
      </Link>
    )

    return (
      <div className='FragmentPager'>
        <PagerLink offset={-1} label='Previous' />
        {' '}
        <PagerLink offset={1} label='Next' />
      </div>
    )
  } else {
    return ''
  }
}
