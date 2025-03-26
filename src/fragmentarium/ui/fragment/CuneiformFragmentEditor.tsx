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
import FragmentService, {
  EditionFields,
} from 'fragmentarium/application/FragmentService'
import ErrorBoundary from 'common/ErrorBoundary'
import ArchaeologyEditor from 'fragmentarium/ui/fragment/ArchaeologyEditor'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { Session } from 'auth/Session'
import ColophonEditor from 'fragmentarium/ui/fragment/ColophonEditor'
import { Colophon } from 'fragmentarium/domain/Colophon'
import ScopeEditor from './ScopeEditor'
import {
  LemmaAnnotations,
  LoadLemmatizer,
} from 'fragmentarium/ui/fragment/lemmatizer2/Lemmatizer'

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
  onToggle
  isColumnVisible: boolean
}

type TabName =
  | 'display'
  | 'edition'
  | 'lemmatization'
  | 'lemmatization2'
  | 'references'
  | 'archaeology'
  | 'colophon'
  | 'permissions'

const tabNames: TabName[] = [
  'display',
  'edition',
  'lemmatization',
  'lemmatization2',
  'references',
  'archaeology',
  'colophon',
  'permissions',
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
  session,
}: {
  name: TabName
  props: TabsProps
  session: Session
}): JSX.Element {
  return {
    display: () => DisplayContents(props),
    edition: () => EditionContents(props),
    lemmatization: () => LemmatizationContents(props),
    lemmatization2: () => LemmatizationContents2(props),
    references: () => ReferencesContents(props),
    archaeology: () => ArchaeologyContents(props),
    colophon: () => ColophonContents(props),
    permissions: () => ScopeContents(props, session),
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
    scope: props.disabled,
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
              ? 'lemmatization2'
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
              session,
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
  const updateEdition = (fields: EditionFields) =>
    props.onSave(
      props.fragmentService.updateEdition(props.fragment.number, fields)
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

function LemmatizationContents2(props: TabsProps): JSX.Element {
  const updateLemmaAnnotation = (annotations: LemmaAnnotations) =>
    props.onSave(
      props.fragmentService.updateLemmaAnnotation(
        props.fragment.number,
        annotations
      )
    )
  return (
    <LoadLemmatizer
      text={props.fragment.text}
      wordService={props.wordService}
      collapseImageColumn={props.onToggle}
      updateLemmaAnnotation={updateLemmaAnnotation}
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

function ScopeContents(props: TabsProps, session: Session): JSX.Element {
  const updateScopes = async (scopes: string[]) => {
    props.onSave(
      props.fragmentService.updateScopes(props.fragment.number, scopes)
    )
  }

  return (
    <ScopeEditor session={session} updateScopes={updateScopes} {...props} />
  )
}

export default ScopeContents
