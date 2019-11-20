import React, { Fragment, FunctionComponent } from 'react'
import classNames from 'classnames'

import withData, { WithoutData } from 'http/withData'
import FragmentLink from 'fragmentarium/ui/FragmentLink'

const numberRegexp = /^([^\d]*)(\d+)$/

type LinkProps = {
  offset: number
  label: string
}
type Props = {
  data
}
const FragmentPager: FunctionComponent<Props> = ({ data }) => {
  //data_dict = {data[direction].fragmentNumber
  console.log(data)
  const PagerLinkNext = ({ nextFragmentNumber }) => (
    <FragmentLink number={nextFragmentNumber}>
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
    <FragmentLink number={previousFragmentNumber}>
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
        previousFragmentNumber={data['next']['fragmentNumber']}
      />
      <PagerLinkNext nextFragmentNumber={data['previous']['fragmentNumber']} />
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
