import React, { FunctionComponent, PropsWithChildren } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'

import SessionContext from 'auth/SessionContext'

import './CuneiformFragment.sass'
import ErrorBoundary from 'common/errors/ErrorBoundary'
import { Session } from 'auth/Session'
import { realiaIcon } from 'realia/ui/realiaIcon'
import {
  ArchaeologyContents,
  ColophonContents,
  DisplayContents,
  EditionContents,
  LemmatizationContents,
  NamedEntityAnnotationContents,
  ReferencesContents,
  ScopeContents,
  TabsProps,
} from 'fragmentarium/ui/fragment/editorTabContents'

const ContentSection = ({
  children,
}: PropsWithChildren<unknown>): JSX.Element => (
  <section className="CuneiformFragment__content">
    <ErrorBoundary>{children}</ErrorBoundary>
  </section>
)

type TabName =
  | 'display'
  | 'edition'
  | 'lemmatization'
  | 'named entities'
  | 'references'
  | 'archaeology'
  | 'colophon'
  | 'permissions'

const tabNames: TabName[] = [
  'display',
  'edition',
  'lemmatization',
  'named entities',
  'references',
  'archaeology',
  'colophon',
  'permissions',
]

const tabIcons: Record<TabName, string> = {
  display: '𒀭',
  edition: '✏',
  lemmatization: 'Ꞌ',
  'named entities': realiaIcon,
  references: '§',
  archaeology: '⛏',
  colophon: '⊕',
  permissions: '⊗',
}

function TabTitle({ name }: { name: TabName }): JSX.Element {
  return (
    <span className="CuneiformFragment__tab-title">
      <span className="CuneiformFragment__tab-icon" aria-hidden="true">
        {tabIcons[name]}
      </span>
      <span className="CuneiformFragment__tab-label">{_.startCase(name)}</span>
    </span>
  )
}

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
      title={<TabTitle name={name} />}
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
    'named entities': () => NamedEntityAnnotationContents(props),
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
  return (
    {
      display: false,
      edition: !session.isAllowedToTransliterateFragments(),
      lemmatization:
        _.isEmpty(props.fragment.text.lines) ||
        !session.isAllowedToLemmatizeFragments(),
      'named entities': !session.isAllowedToAnnotateFragments(),
      references: props.disabled,
      archaeology: props.disabled,
      colophon: props.disabled,
      permissions: props.disabled,
    }[name] ?? false
  )
}

export const EditorTabs: FunctionComponent<TabsProps> = ({
  disabled = false,
  ...props
}: TabsProps) => {
  const tabsId = _.uniqueId('fragment-container-')
  return (
    <SessionContext.Consumer>
      {(session) => {
        if (session.isGuestSession()) {
          return (
            <ContentSection>
              {DisplayContents({ disabled, ...props })}
            </ContentSection>
          )
        }
        return (
          <Tabs
            id={tabsId}
            defaultActiveKey={
              session.isAllowedToTransliterateFragments()
                ? 'edition'
                : 'display'
            }
            mountOnEnter={true}
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
        )
      }}
    </SessionContext.Consumer>
  )
}
