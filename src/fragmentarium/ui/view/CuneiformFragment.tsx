import React, { useState, FunctionComponent } from 'react'
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'

import References from './References'
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

import './CuneiformFragment.css'
import { Fragment, Folio } from 'fragmentarium/domain/fragment'
import Annotator from '../image-annotation/Annotator'

const ContentSection: FunctionComponent = ({ children }) => (
  <section className="CuneiformFragment__content">{children}</section>
)

type TabsProps = {
  fragment: Fragment
  fragmentService
  fragmentSearchService
  onSave
  disabled?: boolean
}
const EditorTabs: FunctionComponent<TabsProps> = ({
  fragment,
  fragmentService,
  fragmentSearchService,
  onSave,
  disabled = false
}) => {
  const tabsId = _.uniqueId('fragment-container-')
  const updateTransliteration = (transliteration, notes) =>
    onSave(
      fragmentService.updateTransliteration(
        fragment.number,
        transliteration,
        notes
      )
    )
  const updateLemmatization = lemmatization =>
    onSave(
      fragmentService.updateLemmatization(
        fragment.number,
        lemmatization.toDto()
      )
    )
  const updateReferences = references =>
    onSave(
      fragmentService.updateReferences(
        fragment.number,
        references.map(serializeReference)
      )
    )
  const searchBibliography = query => fragmentService.searchBibliography(query)
  return (
    <SessionContext.Consumer>
      {session => (
        <Tabs
          id={tabsId}
          defaultActiveKey={session.isAllowedToTransliterateFragments() ? 2 : 1}
        >
          <Tab eventKey={1} title="Display">
            <ContentSection>
              <Display fragment={fragment} />{' '}
            </ContentSection>
          </Tab>
          <Tab
            eventKey={2}
            title="Edition"
            disabled={!session.isAllowedToTransliterateFragments()}
          >
            <ContentSection>
              <Edition
                fragment={fragment}
                updateTransliteration={updateTransliteration}
                fragmentSearchService={fragmentSearchService}
                disabled={disabled}
              />
            </ContentSection>
          </Tab>
          <Tab
            eventKey={3}
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
            eventKey={4}
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
        </Tabs>
      )}
    </SessionContext.Consumer>
  )
}

type CuneiformFragmentProps = {
  fragment: Fragment
  fragmentService
  fragmentSearchService
  activeFolio: Folio | null
  tab: string | null
  onSave
  saving: boolean
  error: Error | null
}
const CuneiformFragment: FunctionComponent<CuneiformFragmentProps> = ({
  fragment,
  fragmentService,
  fragmentSearchService,
  activeFolio,
  tab,
  onSave,
  saving,
  error
}) => {
  return (
    <Container fluid>
      <Row>
        <Annotator fragment={fragment} fragmentService={fragmentService} />
      </Row>
      <Row>
        <Col md={2}>
          <Info fragment={fragment} />
        </Col>
        <Col md={5}>
          <EditorTabs
            fragment={fragment}
            fragmentService={fragmentService}
            fragmentSearchService={fragmentSearchService}
            onSave={onSave}
            disabled={saving}
          />
          <Spinner loading={saving}>Saving...</Spinner>
          <ErrorAlert error={error} />
        </Col>
        <Col md={5}>
          <Images
            fragment={fragment}
            fragmentService={fragmentService}
            activeFolio={activeFolio}
            tab={tab}
          />
        </Col>
      </Row>
    </Container>
  )
}

type ControllerProps = {
  fragment: Fragment
  fragmentService
  fragmentSearchService
  activeFolio?: Folio | null
  tab?: string | null
}
const CuneiformFragmentController: FunctionComponent<ControllerProps> = ({
  fragment,
  fragmentService,
  fragmentSearchService,
  activeFolio = null,
  tab = null
}) => {
  const [currentFragment, setFragment] = useState(fragment)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [setPromise, cancelPromise] = usePromiseEffect()

  const handleSave = promise => {
    cancelPromise()
    setError(null)
    setIsSaving(true)

    const updatePromise = promise
      .then(updatedFragment =>
        fragmentService
          .hydrateReferences(updatedFragment.references)
          .then(hydratedReferences =>
            updatedFragment.setReferences(hydratedReferences)
          )
      )
      .then(hydaratedFragment => {
        setFragment(hydaratedFragment)
        setIsSaving(false)
      })
    setPromise(
      updatePromise.catch(error => {
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
        activeFolio={activeFolio}
        tab={tab}
        onSave={handleSave}
        saving={isSaving}
        error={error}
      />
    </>
  )
}

export default CuneiformFragmentController
