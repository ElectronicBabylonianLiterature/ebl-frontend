import React, { Fragment, FunctionComponent } from 'react'
import classNames from 'classnames'

import withData, { WithoutData } from 'http/withData'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import { NextAndPrevFragment } from 'fragmentarium/domain/pager'

type Props = {
  data: NextAndPrevFragment
  fragmentNumber: string
}
const FragmentPager: FunctionComponent<Props> = ({ data, fragmentNumber }) => {
  const PagerLink = ({ nextFragmentNumber, direction }) => (
    <FragmentLink number={nextFragmentNumber} aria-label={direction}>
      <i
        className={classNames({
          fas: true,
          'fa-angle-right': direction === 'Next',
          'fa-angle-left': direction === 'Previous'
        })}
        aria-hidden
      />
    </FragmentLink>
  )
  return (
    <Fragment>
      <PagerLink nextFragmentNumber={data['previous']} direction="Previous" />
      {fragmentNumber}
      <PagerLink nextFragmentNumber={data['next']} direction="Next" />
    </Fragment>
  )
}

export default withData<WithoutData<Props>, { fragmentService }, any>(
  ({ data, ...props }) => <FragmentPager data={data} {...props} />,
  props => props.fragmentService.fragmentPager(props.fragmentNumber),
  {
    watch: props => [props.fragmentNumber]
  }
)
