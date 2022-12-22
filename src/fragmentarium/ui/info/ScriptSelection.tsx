import { Fragment, Script } from 'fragmentarium/domain/fragment'
import React, { ReactNode, useState, useRef, useEffect } from 'react'
import Select from 'react-select'
import withData from 'http/withData'
import _ from 'lodash'
import { Session } from 'auth/Session'
import SessionContext from 'auth/SessionContext'
import FragmentService from 'fragmentarium/application/FragmentService'
import {
  Period,
  PeriodModifiers,
  periodModifiers,
  Periods,
} from 'common/period'
import { Button, Overlay, Popover } from 'react-bootstrap'
import classNames from 'classnames'
import Bluebird from 'bluebird'
import usePromiseEffect from 'common/usePromiseEffect'
import Spinner from 'common/Spinner'
import './ScriptSelection.sass'

type Props = {
  fragment: Fragment
  updateScript: (script: Script) => Bluebird<Fragment>
  periodOptions: readonly Period[]
}

function ScriptInfo({ script }: { script: Script }): JSX.Element {
  return (
    <>
      {script.periodModifier !== PeriodModifiers.None &&
        script.periodModifier.name}{' '}
      {script.period !== Periods.None && script.period.name}{' '}
      {script.uncertain ? '(?)' : ''}
    </>
  )
}

function ScriptSelection({
  fragment,
  updateScript,
  periodOptions,
}: Props): JSX.Element {
  const [script, setScript] = useState<Script>(fragment.script)
  const [updates, setUpdates] = useState<Script>(fragment.script)
  const [isDisplayed, setIsDisplayed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const target = useRef(null)
  const [setUpdatePromise, cancelUpdatePromise] = usePromiseEffect<void>()

  function updatePeriod(event) {
    setUpdates({ ...updates, period: Periods[event.value] })
  }

  function updatePeriodModifier(event) {
    setUpdates({ ...updates, periodModifier: PeriodModifiers[event.value] })
  }

  function updateIsUncertain() {
    setUpdates({ ...updates, uncertain: !updates.uncertain })
  }

  useEffect(() => {
    setIsDirty(!_.isEqual(updates, script))
  }, [script, updates])

  const modifierOptions = periodModifiers.map((modifier) => ({
    value: modifier.name,
    label: modifier.name,
  }))

  const options = periodOptions.map((period: Period) => ({
    value: period.name,
    label: period.name,
  }))

  const popover = (
    <Popover
      style={{ maxWidth: '600px' }}
      id="popover-select-genre"
      className={'w-100'}
    >
      <Popover.Content>
        <Select
          aria-label="select-period-modifier"
          options={modifierOptions}
          value={{
            value: updates.periodModifier.name,
            label: updates.periodModifier.name,
          }}
          onChange={updatePeriodModifier}
          isSearchable={true}
          autoFocus={false}
        />
        <Select
          aria-label="select-period"
          options={options}
          value={{
            value: updates.period.name,
            label: updates.period.name,
          }}
          onChange={updatePeriod}
          isSearchable={true}
          autoFocus={false}
        />
        <label>
          <input
            type="checkbox"
            checked={updates.uncertain}
            onChange={updateIsUncertain}
          />
          &nbsp;Uncertain
        </label>
        <div>
          <Button
            className="m-1"
            disabled={!isDirty}
            onClick={() => {
              if (updates !== script) {
                cancelUpdatePromise()
                setIsSaving(true)
                setUpdatePromise(
                  updateScript(updates)
                    .then(() => setIsSaving(false))
                    .then(() => setIsDisplayed(false))
                    .then(() => setScript(updates))
                )
              }
            }}
          >
            Save
          </Button>
          <Spinner loading={isSaving}>Saving...</Spinner>
        </div>
      </Popover.Content>
    </Popover>
  )

  return (
    <div>
      Script:
      <br />
      <Overlay
        target={target.current}
        placement="right"
        show={isDisplayed}
        rootClose={true}
        rootCloseEvent={'click'}
        onHide={() => {
          setIsDisplayed(false)
          setUpdates(script)
        }}
      >
        {popover}
      </Overlay>
      <div className="script-selection__button-wrapper">
        <ScriptInfo script={script} />
        <SessionContext.Consumer>
          {(session: Session): ReactNode =>
            session.isAllowedToTransliterateFragments() && (
              <Button
                aria-label="Edit script button"
                variant="light"
                ref={target}
                className={classNames(['float-right', 'far fa-edit', 'mh-100'])}
                onClick={() => setIsDisplayed(true)}
              />
            )
          }
        </SessionContext.Consumer>
      </div>
    </div>
  )
}

export default withData<
  { fragment: Fragment; updateScript: (script: Script) => Bluebird<Fragment> },
  { fragmentService: FragmentService },
  readonly string[]
>(
  ({ fragment, updateScript, data }) => {
    const periodOptions = _(Periods)
      .pick(['None', ...data])
      .values()
      .value() as readonly Period[]
    return (
      <ScriptSelection
        fragment={fragment}
        updateScript={updateScript}
        periodOptions={periodOptions}
      />
    )
  },
  (props) => props.fragmentService.fetchPeriods()
)
