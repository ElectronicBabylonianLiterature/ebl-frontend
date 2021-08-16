import React, { Fragment, FunctionComponent } from 'react'
import classNames from 'classnames'

import withData, { WithoutData } from 'http/withData'

import { FragmentPagerData } from 'fragmentarium/domain/pager'
import FragmentLink, { createFragmentUrl } from 'fragmentarium/ui/FragmentLink'

type Props = {
  data: FragmentPagerData
  fragmentNumber: string
  createUrl?: (number: string) => string
}

const FragmentPager: FunctionComponent<Props> = ({
  data,
  fragmentNumber,
  createUrl,
}: Props): JSX.Element => {
  const PagerLink = ({
    nextFragmentNumber,
    direction,
  }: {
    nextFragmentNumber: string
    direction: string
  }) => (
    <FragmentLink
      createUrl={createUrl}
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
FragmentPager.defaultProps = { createUrl: createFragmentUrl }
export default withData<
  WithoutData<Props>,
  { fragmentService },
  FragmentPagerData
>(
  ({ data, ...props }) => <FragmentPager data={data} {...props} />,
  (props) => props.fragmentService.fragmentPager(props.fragmentNumber),
  {
    watch: (props) => [props.fragmentNumber],
  }
)
