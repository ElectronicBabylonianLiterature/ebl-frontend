import React, { useContext, useState } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import { Fade, Form } from 'react-bootstrap'
import RowsContext, { RowState } from './RowsContext'
import TranslationContext from './TranslationContext'
import { ChapterDisplay } from 'corpus/domain/chapter'

import './ChapterViewSideBar.sass'

function Switch({
  target,
  label = '',
}: {
  target: keyof RowState
  label?: string
}): JSX.Element {
  const [, dispatchRows] = useContext(RowsContext)
  const [isExpanded, setExpanded] = useState(false)
  return (
    <Form.Switch
      className="settings__switch"
      label={label || _.capitalize(target)}
      id={_.uniqueId('sidebar-text-toggle-')}
      onClick={() => {
        dispatchRows({ target: target, type: isExpanded ? 'close' : 'expand' })
        setExpanded(!isExpanded)
      }}
    />
  )
}

function SettingsSection({
  label,
  children,
}: {
  label: string
  children: JSX.Element[]
}): JSX.Element {
  return (
    <Form className="settings__section">
      <h4 className="settings__subheading">{label}</h4>
      {children}
    </Form>
  )
}

function TranslationSettings({
  chapter,
}: {
  chapter: ChapterDisplay
}): JSX.Element {
  const [translationState, dispatchTranslation] = useContext(TranslationContext)

  return (
    <section className="settings__section">
      <h4 className="settings__subheading">Translation</h4>
      <ul className="settings__languages">
        {[...chapter.languages].map((language) => (
          <LanguageItem
            key={language}
            language={language}
            isActive={language === translationState.language}
            translators={chapter.getTranslatorsOf(language)}
            onClick={() =>
              dispatchTranslation({ type: 'setLanguage', language })
            }
          />
        ))}
      </ul>
    </section>
  )
}

interface LanguageItemProps {
  language: string
  isActive: boolean
  translators: { name: string }[]
  onClick: () => void
}

function LanguageItem({
  language,
  isActive,
  translators,
  onClick,
}: LanguageItemProps) {
  return (
    <li>
      <span
        className={classNames({
          // eslint-disable-next-line camelcase
          settings__language: true,
          'settings__language--active': isActive,
        })}
        role="button"
        onClick={onClick}
      >
        {getLanguageDisplayName(language)}
      </span>{' '}
      <span className="settings__translators">
        {translators.map((t) => t.name).join('/')}
      </span>
    </li>
  )
}

function getLanguageDisplayName(language: string): string {
  if (language === 'la') return 'Lingua latina'

  try {
    const displayName = new Intl.DisplayNames([language], {
      type: 'language',
    }).of(language)
    return displayName || language
  } catch {
    return language
  }
}

export function SideBar({ chapter }: { chapter: ChapterDisplay }): JSX.Element {
  const settingsId = _.uniqueId('settings-')
  const [showSettings, setShowSettings] = useState(false)

  return (
    <section className="settings">
      <h3
        role="button"
        className="settings__heading"
        onClick={() => setShowSettings(!showSettings)}
        aria-expanded={showSettings}
        aria-controls={settingsId}
      >
        <i className="fas fa-cog"></i>&nbsp;Settings
      </h3>
      <Fade in={showSettings} mountOnEnter unmountOnExit>
        <div id={settingsId}>
          <SettingsSection label="Text">
            <Switch target={'score'} />
            <Switch target={'oldLineNumbers'} label={'Former Lineation'} />
            <Switch target={'meter'} />
            <Switch target={'ipa'} label={'Phonetic transcription'} />
          </SettingsSection>
          <SettingsSection label="Scholia">
            <Switch target={'parallels'} />
            <Switch target={'notes'} />
          </SettingsSection>
          <TranslationSettings chapter={chapter} />
          <footer className="settings__footer">
            <span
              role="button"
              className="settings__close-button"
              onClick={() => setShowSettings(false)}
            >
              <i className="far fa-times-circle"></i>&nbsp;Close
            </span>
          </footer>
        </div>
      </Fade>
    </section>
  )
}
