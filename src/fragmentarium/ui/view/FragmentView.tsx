import React from 'react'
import _ from 'lodash'

import AppContent from 'common/AppContent'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'
import withData from 'http/withData'
import { Folio, Fragment } from 'fragmentarium/domain/fragment'
import { LinkContainer } from 'react-router-bootstrap'
import { Button } from 'react-bootstrap'
import { createFragmentUrl } from 'fragmentarium/ui/FragmentLink'

function AnnotateButton({ number }: { number: string }): JSX.Element {
  return (
    <LinkContainer to={`${createFragmentUrl(number)}/annotate`}>
      <Button variant="outline-primary">Annotate Fragment Image</Button>
    </LinkContainer>
  )
}

type Props = {
  fragment: Fragment
  fragmentService
  fragmentSearchService
  number: string
  folioName?: string | null | undefined
  folioNumber?: string | null | undefined
  tab?: string | null | undefined
}

function FragmentView({
  fragment,
  fragmentService,
  fragmentSearchService,
  number,
  folioName,
  folioNumber,
  tab
}: Props): JSX.Element {
  const activeFolio =
    folioName && folioNumber
      ? new Folio({
          name: _.isArray(folioName) ? folioName.join('') : folioName,
          number: _.isArray(folioNumber) ? folioNumber.join('') : folioNumber
        })
      : null

  return (
    <AppContent
      crumbs={['Fragmentarium', number]}
      title={
        <FragmentPager
          fragmentNumber={number}
          fragmentService={fragmentService}
        ></FragmentPager>
      }
      actions={<AnnotateButton number={number} />}
      wide
    >
      <CuneiformFragment
        fragment={fragment}
        fragmentService={fragmentService}
        fragmentSearchService={fragmentSearchService}
        activeFolio={activeFolio}
        tab={_.isArray(tab) ? tab.join('') : tab}
      />
    </AppContent>
  )
}

const FragmentWithData = withData<
  Omit<Props, 'fragment'>,
  { number: string },
  Fragment
>(
  ({ data, ...props }) => <FragmentView fragment={data} {...props} />,
  props => props.fragmentService.find(props.number),
  {
    watch: props => [props.number]
  }
)
export default FragmentWithData
