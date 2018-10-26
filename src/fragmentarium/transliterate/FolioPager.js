import React, { Fragment } from 'react'
import _ from 'lodash'
import classNames from 'classnames'

import withData from 'http/withData'
import FragmentLink from 'fragmentarium/FragmentLink'

function FolioPager ({ data, folio }) {
  const PagerLink = ({ label, direction }) => (
    <FragmentLink
      number={data[direction].fragmentNumber}
      folio={{ name: folio.name, number: data[direction].folioNumber }}
      aria-label={label}
    >
      <i className={classNames({
        fas: true,
        'fa-angle-left': direction === 'previous',
        'fa-angle-right': direction === 'next'
      })} aria-hidden />
    </FragmentLink>
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
