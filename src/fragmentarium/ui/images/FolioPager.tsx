import React, { Fragment } from 'react'
import classNames from 'classnames'

import withData, { WithoutData } from 'http/withData'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import { Folio } from 'fragmentarium/domain/fragment'

type Props = {
  data
  folio: Folio
}
function FolioPager({ data, folio }: Props) {
  const PagerLink = ({ label, direction }) => (
    <FragmentLink
      number={data[direction].fragmentNumber}
      folio={
        new Folio({ name: folio.name, number: data[direction].folioNumber })
      }
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
      Browse {folio.humanizedName}&apos;s Folios{' '}
      {data && (
        <PagerLink
          direction="next"
          label={`Next ${folio.humanizedName}'s Folio`}
        />
      )}
    </Fragment>
  )
}

export default withData<
  WithoutData<Props>,
  { fragmentNumber: string; fragmentService },
  any
>(
  ({ data, ...props }) => <FolioPager data={data} {...props} />,
  props => props.fragmentService.folioPager(props.folio, props.fragmentNumber),
  {
    watch: props => [props.folio, props.fragmentNumber]
  }
)
