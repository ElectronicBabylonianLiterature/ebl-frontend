import React, { Fragment } from 'react'
import classNames from 'classnames'

import withData from 'http/withData'
import FragmentLink from 'fragmentarium/ui/FragmentLink'

function FolioPager({ data, folio }) {
  const PagerLink = ({ label, direction }) => (
    <FragmentLink
      number={data[direction].fragmentNumber}
      folio={{ name: folio.name, number: data[direction].folioNumber }}
      aria-label={label}
    >
      <i
        className={classNames({
          fas: true,
          'fa-angle-left': direction === 'previous',
          'fa-angle-right': direction === 'next'
        })}
        aria-hidden
      />
    </FragmentLink>
  )

  return (
    <Fragment>
      {data && (
        <PagerLink
          direction="previous"
          label={`Previous ${folio.humanizedName}'s Folio`}
        />
      )}{' '}
      Browse {folio.humanizedName}'s Folios{' '}
      {data && (
        <PagerLink
          direction="next"
          label={`Next ${folio.humanizedName}'s Folio`}
        />
      )}
    </Fragment>
  )
}

export default withData(
  ({ data, ...props }) => <FolioPager data={data} {...props} />,
  props => props.fragmentService.folioPager(props.folio, props.fragmentNumber),
  {
    watch: props => [props.folio, props.fragmentNumber]
  }
)
