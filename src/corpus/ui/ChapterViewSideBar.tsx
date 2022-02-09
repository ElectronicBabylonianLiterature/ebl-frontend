import React, { useContext, useState } from 'react'
import _ from 'lodash'
import { Fade, Form } from 'react-bootstrap'
import ChapterViewContext from './ChapterViewContext'

function TextSettings(): JSX.Element {
  const [, dispatch] = useContext(ChapterViewContext)
  const [isExpandAll, setExpandAll] = useState(false)

  return (
    <Form className="settings__section">
      <h4 className="settings__subheading">Text</h4>
      <Form.Switch
        className="settings__switch"
        label="Score"
        id={_.uniqueId('sidebar-text-toggle-')}
        onClick={() => {
          if (isExpandAll) {
            dispatch({ type: 'closeAll' })
          } else {
            dispatch({ type: 'expandAll' })
          }
          setExpandAll(!isExpandAll)
        }}
      />
    </Form>
  )
}
export function SideBar(): JSX.Element {
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
          <TextSettings />
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
