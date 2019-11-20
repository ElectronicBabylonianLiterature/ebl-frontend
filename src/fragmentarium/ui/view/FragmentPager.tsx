import React, { Fragment, FunctionComponent } from 'react'
import classNames from 'classnames'

import withData, { WithoutData } from 'http/withData'
import FragmentLink from 'fragmentarium/ui/FragmentLink'

type Props = {
  data
  children
}
const FragmentPager: FunctionComponent<Props> = ({ data, children }) => {
  //data_dict = {data[direction].fragmentNumber
  console.log(data)
  console.log(children)
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
      {children}
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
  props =>
    props.fragmentService.fragmentPager(props.children, props.fragmentNumber),
  {
    watch: props => [props.children, props.fragmentNumber]
  }
)
