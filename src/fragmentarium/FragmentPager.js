import React from 'react'
import { Link } from 'react-router-dom'

import './FragmentPager.css'

const numberRegexp = /^([^\d]*)(\d+)$/

export default function FragmentPager ({number}) {
  const match = numberRegexp.exec(number)
  if (match) {
    const prefix = match[1]
    const current = Number(match[2] || 0)

    return (
      <div className='FragmentPager'>
        <Link to={`/fragmentarium/${prefix}${current - 1}`} aria-label='Previous'><i className='fas fa-angle-left' aria-hidden /></Link>
        {' '}
        <Link to={`/fragmentarium/${prefix}${current + 1}`} aria-label='Next'><i className='fas fa-angle-right' aria-hidden /></Link>
      </div>
    )
  } else {
    return ''
  }
}
