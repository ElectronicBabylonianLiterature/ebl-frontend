import React, { Fragment, FunctionComponent } from 'react'
import classNames from 'classnames'

import withData, { WithoutData } from 'http/withData'
import FragmentLink from 'fragmentarium/ui/FragmentLink'

type Props = {
  data
  children
}
const FragmentPager: FunctionComponent<Props> = ({ data, children }) => {
  const PagerLinkNext = ({ nextFragmentNumber }) => (
    <FragmentLink number={nextFragmentNumber} aria-label={'Next'}>
      <i
        className={classNames({
          fas: true,
          'fa-angle-right': true
        })}
        aria-hidden
      />
    </FragmentLink>
  )
  const PagerLinkPrevious = ({ previousFragmentNumber }) => (
    <FragmentLink number={previousFragmentNumber} aria-label={'Previous'}>
      <i
        className={classNames({
          fas: true,
          'fa-angle-left': true
        })}
        aria-hidden
      />
    </FragmentLink>
  )

  return (
    <Fragment>
      <PagerLinkPrevious
        previousFragmentNumber={data['previous']['fragmentNumber']}
      />
      {children}
      <PagerLinkNext nextFragmentNumber={data['next']['fragmentNumber']} />
    </Fragment>
  )
}
export default withData<
  WithoutData<Props>,
  { fragmentNumber: string; fragmentService },
  any
>(
  ({ data, ...props }) => <FragmentPager data={data} {...props} />,
  props => props.fragmentService.fragmentPager(props.fragmentNumber),
  {
    watch: props => [props.fragmentNumber]
  }
)
