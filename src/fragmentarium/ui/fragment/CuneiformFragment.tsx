import React, { useState, FunctionComponent } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import FragmentInCorpus from 'fragmentarium/ui/fragment/FragmentInCorpus'
import Images from 'fragmentarium/ui/images/Images'
import Info from 'fragmentarium/ui/info/Info'
import ErrorAlert from 'common/errors/ErrorAlert'
import Spinner from 'common/ui/Spinner'
import useFragmentSaves from 'fragmentarium/ui/fragment/useFragmentSaves'
import 'fragmentarium/ui/fragment/CuneiformFragment.sass'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import WordService from 'dictionary/application/WordService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import ErrorBoundary from 'common/errors/ErrorBoundary'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { EditorTabs } from 'fragmentarium/ui/fragment/CuneiformFragmentEditor'
import DossiersService from 'dossiers/application/DossiersService'

type CuneiformFragmentProps = {
  fragment: Fragment
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  dossiersService: DossiersService
  afoRegisterService: AfoRegisterService
  wordService: WordService
  findspotService: FindspotService
  activeFolio: Folio | null
  tab: string | null
  onSave: (save: () => Promise<Fragment>) => Promise<Fragment>
  enqueueSave: (save: () => Promise<Fragment>) => Promise<Fragment>
  saving: boolean
  error: Error | null
  activeLine: string
}

const withErrorBoundary = (children: React.ReactNode) => (
  <ErrorBoundary>{children}</ErrorBoundary>
)

const CuneiformFragment: FunctionComponent<CuneiformFragmentProps> = ({
  fragment,
  fragmentService,
  fragmentSearchService,
  dossiersService,
  afoRegisterService,
  wordService,
  findspotService,
  activeFolio,
  tab,
  onSave,
  enqueueSave,
  saving,
  error,
  activeLine,
}: CuneiformFragmentProps) => {
  const [isColumnVisible, setColumnVisible] = useState(true)

  const handleToggle = (isCollapsed: boolean) => {
    setColumnVisible(!isCollapsed)
  }

  return (
    <Container fluid>
      <Row>
        <Col xs={12} md={2} className={'CuneiformFragment__info'}>
          {withErrorBoundary(
            <Info
              fragment={fragment}
              fragmentService={fragmentService}
              dossiersService={dossiersService}
              afoRegisterService={afoRegisterService}
              onSave={onSave}
              enqueueSave={enqueueSave}
            />,
          )}
        </Col>
        <Col xs={12} md={isColumnVisible ? 5 : 10}>
          {withErrorBoundary(
            <>
              <FragmentInCorpus
                fragment={fragment}
                fragmentService={fragmentService}
              />
              <EditorTabs
                fragment={fragment}
                fragmentService={fragmentService}
                fragmentSearchService={fragmentSearchService}
                wordService={wordService}
                findspotService={findspotService}
                onSave={onSave}
                disabled={saving}
                activeLine={activeLine}
                onToggle={handleToggle}
                isColumnVisible={isColumnVisible}
              />
              <Spinner loading={saving}>Saving...</Spinner>
              <ErrorAlert error={error} />
            </>,
          )}
        </Col>
        {isColumnVisible && (
          <Col xs={12} md={5}>
            {withErrorBoundary(
              <Images
                key={fragment.number}
                fragment={fragment}
                fragmentService={fragmentService}
                activeFolio={activeFolio}
                tab={tab}
              />,
            )}
          </Col>
        )}
      </Row>
    </Container>
  )
}

type ControllerProps = {
  fragment: Fragment
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  dossiersService: DossiersService
  afoRegisterService: AfoRegisterService
  wordService: WordService
  findspotService: FindspotService
  activeFolio?: Folio | null
  tab?: string | null
  activeLine: string
}

const CuneiformFragmentController: FunctionComponent<ControllerProps> = ({
  fragment,
  fragmentService,
  fragmentSearchService,
  dossiersService,
  afoRegisterService,
  wordService,
  findspotService,
  activeFolio = null,
  tab = null,
  activeLine,
}: ControllerProps) => {
  const {
    visibleFragment,
    isCurrentFragment,
    isSaving,
    error,
    handleSave,
    enqueueSave,
  } = useFragmentSaves(fragment)

  return (
    <>
      <CuneiformFragment
        key={visibleFragment.number}
        fragment={visibleFragment}
        fragmentService={fragmentService}
        fragmentSearchService={fragmentSearchService}
        dossiersService={dossiersService}
        afoRegisterService={afoRegisterService}
        wordService={wordService}
        findspotService={findspotService}
        activeFolio={activeFolio}
        tab={tab}
        onSave={handleSave}
        enqueueSave={enqueueSave}
        saving={isCurrentFragment && isSaving}
        error={isCurrentFragment ? error : null}
        activeLine={activeLine}
      />
    </>
  )
}

export default CuneiformFragmentController
