import React, { useState } from 'react'
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'

import References from './References'
import ReferenceList from 'bibliography/ReferenceList'
import Edition from 'fragmentarium/edition/Edition'
import Lemmatizer from 'fragmentarium/lemmatization/Lemmatizer'
import Display from './Display'
import Details from './Details'
import Record from './Record'
import OrganizationLinks from './OrganizationLinks'
import Folios from './Folios'
import SessionContext from 'auth/SessionContext'
import ErrorAlert from 'common/ErrorAlert'
import Spinner from 'common/Spinner'
import UncuratedReferences from './UncuratedReferences'
import { serializeReference } from 'bibliography/Reference'
import usePromiseEffect from 'common/usePromiseEffect'

import './CuneiformFragment.css'

function ContentSection({ children }) {
  return <section className="CuneiformFragment__content">{children}</section>
}

function Info({ fragment }) {
  return (
    <>
      <Details fragment={fragment} />
      <section>
        <h3>References</h3>
        <ReferenceList references={fragment.references} />
        {fragment.hasUncuratedReferences && (
          <UncuratedReferences
            uncuratedReferences={fragment.uncuratedReferences}
          />
        )}
      </section>
      <Record record={fragment.uniqueRecord} />
      <OrganizationLinks
        cdliNumber={fragment.cdliNumber}
        bmIdNumber={fragment.bmIdNumber}
      />
    </>
  )
}

function EditorTabs({ fragment, fragmentService, onSave, disabled }) {
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
                fragmentService={fragmentService}
                updateTransliteration={updateTransliteration}
                disabled={disabled}
              />
            </ContentSection>
          </Tab>
          <Tab
            eventKey={3}
            title="Lemmatization"
            disabled={
              fragment.text.lines.isEmpty() ||
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

function CuneiformFragment({
  fragment,
  fragmentService,
  activeFolio,
  onSave,
  saving,
  error
}) {
  return (
    <Container fluid>
      <Row>
        <Col md={2}>
          <Info fragment={fragment} />
        </Col>
        <Col md={5}>
          <EditorTabs
            fragment={fragment}
            fragmentService={fragmentService}
            onSave={onSave}
            disabled={saving}
          />
          <Spinner loading={saving}>Saving...</Spinner>
          <ErrorAlert error={error} />
        </Col>
        <Col md={5}>
          <Folios
            fragment={fragment}
            fragmentService={fragmentService}
            activeFolio={activeFolio}
          />
        </Col>
      </Row>
    </Container>
  )
}

function CuneiformFragmentController({
  fragment,
  fragmentService,
  activeFolio
}) {
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
          .hydrateReferences(updatedFragment.references.toJS())
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
        activeFolio={activeFolio}
        onSave={handleSave}
        saving={isSaving}
        error={error}
      />
    </>
  )
}

export default CuneiformFragmentController
