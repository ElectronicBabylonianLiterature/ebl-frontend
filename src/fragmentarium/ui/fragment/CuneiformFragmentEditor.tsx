import React, { FunctionComponent, PropsWithChildren } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import _, { capitalize } from 'lodash'

import References from 'fragmentarium/ui/fragment/References'
import Edition from 'fragmentarium/ui/edition/Edition'
import Lemmatizer from 'fragmentarium/ui/lemmatization/Lemmatizer'
import Display from 'fragmentarium/ui/display/Display'
import SessionContext from 'auth/SessionContext'
import serializeReference from 'bibliography/application/serializeReference'

import './CuneiformFragment.sass'
import { Fragment } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import ErrorBoundary from 'common/ErrorBoundary'
import ArchaeologyEditor from 'fragmentarium/ui/fragment/ArchaeologyEditor'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { Session } from 'auth/Session'
import ColophonEditor from 'fragmentarium/ui/fragment/ColophonEditor'
import { Colophon } from 'fragmentarium/domain/Colophon'
import TokenAnnotationTool from './TokenAnnotationTool'

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

type TabName =
  | 'display'
  | 'edition'
  | 'lemmatization'
  | 'references'
  | 'archaeology'
  | 'colophon'
  | 'annotation'

const tabNames: TabName[] = [
  'display',
  'edition',
  'lemmatization',
  'references',
  'archaeology',
  'colophon',
  'annotation',
]

function EditorTab({
  children,
  name,
  disabled,
}: {
  children: JSX.Element
  name: TabName
  disabled: boolean
}): JSX.Element {
  return (
    <Tab
      key={name}
      eventKey={name}
      title={capitalize(name)}
      disabled={disabled}
    >
      <ContentSection>{children}</ContentSection>
    </Tab>
  )
}

function TabContentsMatcher({
  name,
  props,
}: {
  name: TabName
  props: TabsProps
}): JSX.Element {
  return {
    display: () => DisplayContents(props),
    edition: () => EditionContents(props),
    lemmatization: () => LemmatizationContents(props),
    references: () => ReferencesContents(props),
    archaeology: () => ArchaeologyContents(props),
    colophon: () => ColophonContents(props),
    annotation: () => AnnotationContents(props),
  }[name]()
}

function isTabDisabled({
  name,
  session,
  props,
}: {
  props: TabsProps
  name: TabName
  session: Session
}): boolean {
  return {
    display: false,
    edition: !session.isAllowedToTransliterateFragments(),
    lemmatization:
      _.isEmpty(props.fragment.text.lines) ||
      !session.isAllowedToLemmatizeFragments(),
    references: props.disabled,
    archeology: props.disabled,
    colophon: props.disabled,
  }[name]
}

export const EditorTabs: FunctionComponent<TabsProps> = ({
  disabled = false,
  ...props
}: TabsProps) => {
  const tabsId = _.uniqueId('fragment-container-')
  return (
    <SessionContext.Consumer>
      {(session) => (
        <Tabs
          id={tabsId}
          defaultActiveKey={
            session.isAllowedToTransliterateFragments()
              ? 'annotation'
              : 'display'
          }
          mountOnEnter={true}
          className={
            session.isGuestSession() ? 'CuneiformFragment__tabs-hidden' : ''
          }
        >
          {tabNames.map((name) => {
            const children = TabContentsMatcher({
              name,
              props: { disabled, ...props },
            })
            return EditorTab({
              children,
              name,
              disabled: isTabDisabled({ name, session, props }),
            })
          })}
        </Tabs>
      )}
    </SessionContext.Consumer>
  )
}

function DisplayContents(props: TabsProps): JSX.Element {
  return <Display {...props} />
}

function EditionContents(props: TabsProps): JSX.Element {
  const updateEdition = (
    transliteration: string,
    notes: string,
    introduction: string
  ) =>
    props.onSave(
      props.fragmentService.updateEdition(
        props.fragment.number,
        transliteration,
        notes,
        introduction
      )
    )
  return <Edition updateEdition={updateEdition} {...props} />
}

function LemmatizationContents(props: TabsProps): JSX.Element {
  const updateLemmatization = (lemmatization) =>
    props.onSave(
      props.fragmentService.updateLemmatization(
        props.fragment.number,
        lemmatization.toDto()
      )
    )
  return (
    <Lemmatizer
      updateLemmatization={updateLemmatization}
      text={props.fragment.text}
      {...props}
    />
  )
}

function ReferencesContents(props: TabsProps): JSX.Element {
  const updateReferences = (references) =>
    props.onSave(
      props.fragmentService.updateReferences(
        props.fragment.number,
        references.map(serializeReference)
      )
    )
  const searchBibliography = (query) =>
    props.fragmentService.searchBibliography(query)
  return (
    <References
      references={props.fragment.references}
      searchBibliography={searchBibliography}
      updateReferences={updateReferences}
      disabled={props.disabled}
    />
  )
}

function ArchaeologyContents(props: TabsProps): JSX.Element {
  const updateArchaeology = (archaeology: ArchaeologyDto) =>
    props.onSave(
      props.fragmentService.updateArchaeology(
        props.fragment.number,
        archaeology
      )
    )
  return (
    <ArchaeologyEditor
      updateArchaeology={updateArchaeology}
      archaeology={props.fragment.archaeology || null}
      {...props}
    />
  )
}

function ColophonContents(props: TabsProps): JSX.Element {
  const updateColophon = async (colophon: Colophon) => {
    props.onSave(
      props.fragmentService.updateColophon(props.fragment.number, colophon)
    )
  }

  return <ColophonEditor updateColophon={updateColophon} {...props} />
}

function AnnotationContents(props: TabsProps): JSX.Element {
  const updateFragmentAnnotation = async (fragment: Fragment) => {
    console.log('Saved fragment!')
  }
  return (
    <TokenAnnotationTool
      fragment={props.fragment}
      onSave={updateFragmentAnnotation}
    />
  )
}
