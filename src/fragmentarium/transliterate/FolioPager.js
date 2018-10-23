import React, { Fragment } from 'react'
import _ from 'lodash'

import withData from 'http/withData'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

function FolioPager ({ data, folio }) {
  const PagerLink = ({ label, direction }) => (
    // Double encoding is needed due to https://github.com/ReactTraining/history/issues/505
    <Link to={`/fragmentarium/${encodeURIComponent(encodeURIComponent(data[direction].fragmentNumber))}`} aria-label={label}>
      <i className={classNames({
        fas: true,
        'fa-angle-left': direction === 'previous',
        'fa-angle-right': direction === 'next'
      })} aria-hidden />
    </Link>
  )

  return (
    <Fragment>
      {data && <PagerLink
        direction='previous'
        label='Previous'
      />}
      {' '}Browse {folio.humanizedName}'s Folios{' '}
      {data && <PagerLink
        direction='next'
        label='Next'
      />}
    </Fragment>
  )
}

export default withData(
  ({ data, ...props }) => <FolioPager
    data={data}
    {...props}
  />,
  props => props.fragmentService.folioPager(props.folio, props.fragmentNumber),
  {
    shouldUpdate: (prevProps, props) => (
      !_.isEqual(prevProps.folio, props.folio) ||
      prevProps.fragmentNumber !== props.fragmentNumber
    )
  }
)
