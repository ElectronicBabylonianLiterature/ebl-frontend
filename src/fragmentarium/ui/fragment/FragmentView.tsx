import React from 'react'

import AppContent from 'common/AppContent'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'
import withData from 'http/withData'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import { LinkContainer } from 'react-router-bootstrap'
import { Button, ButtonGroup } from 'react-bootstrap'
import { createFragmentUrl } from 'fragmentarium/ui/FragmentLink'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import Download from 'fragmentarium/ui/fragment/Download'
import SubmitCorrectionsButton from 'common/SubmitCorrectionsButton'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'

function TagSignsButton({
  number,
  disabled,
}: {
  number: string
  disabled?: boolean
}): JSX.Element {
  return (
    <LinkContainer to={`${createFragmentUrl(number)}/annotate`}>
      <Button variant="outline-primary" disabled={disabled}>
        Tag signs
      </Button>
    </LinkContainer>
  )
}

type Props = {
  fragment: Fragment
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  wordService: WordService
  number: string
  folioName: string | null
  folioNumber: string | null
  tab: string | null
  activeLine: string
}

function createActiveFolio(
  name: string | null,
  number: string | null
): Folio | null {
  return name && number
    ? new Folio({
        name,
        number,
      })
    : null
}

function FragmentView({
  fragment,
  fragmentService,
  fragmentSearchService,
  wordService,
  number,
  folioName,
  folioNumber,
  tab,
  activeLine,
}: Props): JSX.Element {
  const activeFolio = createActiveFolio(folioName, folioNumber)

  return (
    <AppContent
      crumbs={[new SectionCrumb('Fragmentarium'), new TextCrumb(number)]}
      title={
        <FragmentPager
          fragmentNumber={number}
          fragmentService={fragmentService}
        />
      }
      actions={
        <ButtonGroup>
          <Download
            fragment={fragment}
            wordService={wordService}
            fragmentService={fragmentService}
          />
          <TagSignsButton number={number} disabled={!fragment.hasPhoto} />
          <SubmitCorrectionsButton id={`fragment ${number}`} />
        </ButtonGroup>
      }
      wide
    >
      <CuneiformFragment
        fragment={fragment}
        fragmentService={fragmentService}
        fragmentSearchService={fragmentSearchService}
        wordService={wordService}
        activeFolio={activeFolio}
        tab={tab}
        activeLine={activeLine}
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
  (props) => props.fragmentService.find(props.number),
  {
    watch: (props) => [props.number],
  }
)
export default FragmentWithData
