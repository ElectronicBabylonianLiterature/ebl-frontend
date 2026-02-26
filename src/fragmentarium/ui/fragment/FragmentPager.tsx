import React, { Fragment, FunctionComponent } from 'react'
import classNames from 'classnames'

import withData, { WithoutData } from 'http/withData'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import { FragmentPagerData } from 'fragmentarium/domain/pager'

type Props = {
  data: FragmentPagerData
  fragmentNumber: string
}

const FragmentPager: FunctionComponent<Props> = ({
  data,
  fragmentNumber,
}: Props): JSX.Element => {
  const PagerLink = ({
    nextFragmentNumber,
    direction,
  }: {
    nextFragmentNumber: string
    direction: string
  }) => (
    <FragmentLink
      number={nextFragmentNumber}
      aria-label={direction}
      folio={null}
    >
      <i
        className={classNames({
          fas: true,
          'fa-angle-right': direction === 'Next',
          'fa-angle-left': direction === 'Previous',
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

export default withData<
  WithoutData<Props>,
  { fragmentService },
  FragmentPagerData
>(
  ({ data, ...props }) => <FragmentPager data={data} {...props} />,
  (props) => props.fragmentService.fragmentPager(props.fragmentNumber),
  {
    watch: (props) => [props.fragmentNumber],
  },
)
