import React, { useState, FunctionComponent, PropsWithChildren } from 'react'
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'

import References from 'fragmentarium/ui/fragment/References'
import FragmentInCorpus from 'fragmentarium/ui/fragment/FragmentInCorpus'
import Edition from 'fragmentarium/ui/edition/Edition'
import Lemmatizer from 'fragmentarium/ui/lemmatization/Lemmatizer'
import Display from 'fragmentarium/ui/display/Display'
import Images from 'fragmentarium/ui/images/Images'
import Info from 'fragmentarium/ui/info/Info'
import SessionContext from 'auth/SessionContext'
import ErrorAlert from 'common/ErrorAlert'
import Spinner from 'common/Spinner'
import serializeReference from 'bibliography/application/serializeReference'
import usePromiseEffect from 'common/usePromiseEffect'

import './CuneiformFragment.sass'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import WordService from 'dictionary/application/WordService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import ErrorBoundary from 'common/ErrorBoundary'
import ArchaeologyEditor from 'fragmentarium/ui/fragment/ArchaeologyEditor'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeology'
import { FindspotService } from 'fragmentarium/application/FindspotService'

const ContentSection: FunctionComponent = ({
  children,
}: PropsWithChildren<unknown>) => (
  <section className="CuneiformFragment__content">
    <ErrorBoundary>{children}</ErrorBoundary>
  </section>
)

type TabsProps = {
  fragment: Fragment
  fragmentService: FragmentService
  fragmentSearchService
  wordService: WordService
  findspotService: FindspotService
  onSave
  disabled?: boolean
  activeLine: string
}
const EditorTabs: FunctionComponent<TabsProps> = ({
  fragment,
  fragmentService,
  fragmentSearchService,
  wordService,
  findspotService,
  onSave,
  disabled = false,
  activeLine,
}: TabsProps) => {
  const tabsId = _.uniqueId('fragment-container-')

  const updateEdition = (
    transliteration: string,
    notes: string,
    introduction: string
  ) =>
    onSave(
      fragmentService.updateEdition(
        fragment.number,
        transliteration,
        notes,
        introduction
      )
    )
  const updateLemmatization = (lemmatization) =>
    onSave(
      fragmentService.updateLemmatization(
        fragment.number,
        lemmatization.toDto()
      )
    )
  const updateReferences = (references) =>
    onSave(
      fragmentService.updateReferences(
        fragment.number,
        references.map(serializeReference)
      )
    )
  const updateArchaeology = (archaeology: ArchaeologyDto) =>
    onSave(fragmentService.updateArchaeology(fragment.number, archaeology))
  const searchBibliography = (query) =>
    fragmentService.searchBibliography(query)
  return (
    <SessionContext.Consumer>
      {(session) => (
        <Tabs
          id={tabsId}
          defaultActiveKey={
            session.isAllowedToTransliterateFragments() ? 'edition' : 'display'
          }
          mountOnEnter={true}
          className={
            session.isGuestSession() ? 'CuneiformFragment__tabs-hidden' : ''
          }
        >
          <Tab eventKey="display" title="Display">
            <ContentSection>
              <Display
                fragment={fragment}
                wordService={wordService}
                activeLine={activeLine}
              />
            </ContentSection>
          </Tab>
          <Tab
            eventKey="edition"
            title="Edition"
            disabled={!session.isAllowedToTransliterateFragments()}
          >
            <ContentSection>
              <Edition
                fragment={fragment}
                updateEdition={updateEdition}
                fragmentSearchService={fragmentSearchService}
                disabled={disabled}
              />
            </ContentSection>
          </Tab>
          <Tab
            eventKey="lemmatization"
            title="Lemmatization"
            disabled={
              _.isEmpty(fragment.text.lines) ||
              !session.isAllowedToLemmatizeFragments()
            }
          >
            <ContentSection>
              <Lemmatizer
                fragmentService={fragmentService}
                updateLemmatization={updateLemmatization}
                text={fragment.text}
                disabled={disabled}
              />
            </ContentSection>
          </Tab>
          <Tab
            eventKey="refrences"
            title="References"
            disabled={!session.isAllowedToTransliterateFragments()}
          >
            <ContentSection>
              <References
                references={fragment.references}
                searchBibliography={searchBibliography}
                updateReferences={updateReferences}
                disabled={disabled}
              />
            </ContentSection>
          </Tab>
          <Tab
            eventKey="archaeologicalContext"
            title="Archaeology"
            disabled={!session.isAllowedToTransliterateFragments()}
          >
            <ContentSection>
              <ArchaeologyEditor
                archaeology={fragment.archaeology}
                updateArchaeology={updateArchaeology}
                disabled={disabled}
                findspotService={findspotService}
              />
            </ContentSection>
          </Tab>
        </Tabs>
      )}
    </SessionContext.Consumer>
  )
}

type CuneiformFragmentProps = {
  fragment: Fragment
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  wordService: WordService
  findspotService: FindspotService
  activeFolio: Folio | null
  tab: string | null
  onSave: (updatedFragment: Promise<Fragment>) => void
  saving: boolean
  error: Error | null
  activeLine: string
}
const CuneiformFragment: FunctionComponent<CuneiformFragmentProps> = ({
  fragment,
  fragmentService,
  fragmentSearchService,
  wordService,
  findspotService,
  activeFolio,
  tab,
  onSave,
  saving,
  error,
  activeLine,
}: CuneiformFragmentProps) => {
  return (
    <Container fluid>
      <Row>
        <Col md={2} className={'CuneiformFragment__info'}>
          <ErrorBoundary>
            <Info
              fragment={fragment}
              fragmentService={fragmentService}
              onSave={onSave}
            />
          </ErrorBoundary>
        </Col>
        <Col md={5}>
          <ErrorBoundary>
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
            />
            <Spinner loading={saving}>Saving...</Spinner>
            <ErrorAlert error={error} />
          </ErrorBoundary>
        </Col>
        <Col md={5}>
          <ErrorBoundary>
            <Images
              fragment={fragment}
              fragmentService={fragmentService}
              activeFolio={activeFolio}
              tab={tab}
            />
          </ErrorBoundary>
        </Col>
      </Row>
    </Container>
  )
}

type ControllerProps = {
  fragment: Fragment
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
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
