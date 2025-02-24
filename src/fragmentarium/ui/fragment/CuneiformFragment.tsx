import React, { useState, FunctionComponent } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import FragmentInCorpus from 'fragmentarium/ui/fragment/FragmentInCorpus'
import Images from 'fragmentarium/ui/images/Images'
import Info from 'fragmentarium/ui/info/Info'
import ErrorAlert from 'common/ErrorAlert'
import Spinner from 'common/Spinner'
import usePromiseEffect from 'common/usePromiseEffect'
import './CuneiformFragment.sass'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import WordService from 'dictionary/application/WordService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import ErrorBoundary from 'common/ErrorBoundary'
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
  onSave: (updatedFragment: Promise<Fragment>) => void
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
        <Col md={2} className={'CuneiformFragment__info'}>
          {withErrorBoundary(
            <Info
              fragment={fragment}
              fragmentService={fragmentService}
              dossiersService={dossiersService}
              afoRegisterService={afoRegisterService}
              onSave={onSave}
            />
          )}
        </Col>
        <Col md={isColumnVisible ? 5 : 10}>
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
            </>
          )}
        </Col>
        {isColumnVisible && (
          <Col md={5}>
            {withErrorBoundary(
              <Images
                fragment={fragment}
                fragmentService={fragmentService}
                activeFolio={activeFolio}
                tab={tab}
              />
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
  const [currentFragment, setFragment] = useState(fragment)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [setPromise, cancelPromise] = usePromiseEffect()

  const handleSave = (promise) => {
    cancelPromise()
    setError(null)
    setIsSaving(true)

    const updatePromise = promise.then((updatedFragment) => {
      setFragment(updatedFragment)
      setIsSaving(false)
      return updatedFragment
    })
    setPromise(
      updatePromise.catch((error) => {
        setError(error)
        setIsSaving(false)
      })
    )
    return updatePromise
  }

  return (
    <>
      <CuneiformFragment
        fragment={currentFragment}
        fragmentService={fragmentService}
        fragmentSearchService={fragmentSearchService}
        dossiersService={dossiersService}
        afoRegisterService={afoRegisterService}
        wordService={wordService}
        findspotService={findspotService}
        activeFolio={activeFolio}
        tab={tab}
        onSave={handleSave}
        saving={isSaving}
        error={error}
        activeLine={activeLine}
      />
    </>
  )
}

export default CuneiformFragmentController
