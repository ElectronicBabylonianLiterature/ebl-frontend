// @flow
import React, { Component } from 'react'
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'
import { Promise } from 'bluebird'

import References from './References'
import ReferenceList from 'bibliography/ReferenceList'
import Edition from 'fragmentarium/edition/Edition'
import Lemmatizer from 'fragmentarium/lemmatization/Lemmatizer'
import Display from 'fragmentarium/view/Display'
import Details from './Details'
import Record from './Record'
import OrganizationLinks from './OrganizationLinks'
import Folios from './Folios'
import SessionContext from 'auth/SessionContext'
import ErrorAlert from 'common/ErrorAlert'
import Spinner from 'common/Spinner'
import UncuratedReferences from './UncuratedReferences'
import { serializeReference } from 'bibliography/Reference'

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

class CuneiformFragmentController extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fragment: props.fragment,
      saving: false,
      error: null
    }
    this.updatePromise = Promise.resolve()
  }

  componentWillUnmount() {
    this.updatePromise.cancel()
  }

  handleSave = promise => {
    this.updatePromise.cancel()
    this.setState({
      ...this.state,
      error: null,
      saving: true
    })
    this.updatePromise = promise
      .then(updatedFragment =>
        this.props.fragmentService
          .hydrateReferences(updatedFragment.references.toJS())
          .then(hydratedReferences =>
            updatedFragment.setReferences(hydratedReferences)
          )
      )
      .then(hydaratedFragment => {
        this.setState({
          fragment: hydaratedFragment,
          saving: false
        })
        return hydaratedFragment
      })
    this.updatePromise.catch(error =>
      this.setState({
        ...this.state,
        saving: false,
        error: error
      })
    )
    return this.updatePromise
  }

  render() {
    return (
      <>
        <CuneiformFragment
          fragment={this.state.fragment}
          fragmentService={this.props.fragmentService}
          activeFolio={this.props.activeFolio}
          onSave={this.handleSave}
          saving={this.state.saving}
          error={this.state.error}
        />
      </>
    )
  }
}

export default CuneiformFragmentController
