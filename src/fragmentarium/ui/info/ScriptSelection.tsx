import React from 'react'
import { Fragment, Script } from 'fragmentarium/domain/fragment'
import { useState, useRef, useEffect } from 'react'
import Select from 'react-select'
import withData from 'http/withData'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import {
  Period,
  PeriodModifiers,
  periodModifiers,
  Periods,
} from 'common/period'
import { Button, Overlay, Popover } from 'react-bootstrap'
import Bluebird from 'bluebird'
import usePromiseEffect from 'common/usePromiseEffect'
import Spinner from 'common/Spinner'
import { MetaEditButton } from 'fragmentarium/ui/info/MetaEditButton'
import ExternalLink from 'common/ExternalLink'

type Props = {
  fragment: Fragment
  updateScript: (script: Script) => Bluebird<Fragment>
  periodOptions: readonly Period[]
}

function ScriptInfo({ script }: { script: Script }): JSX.Element {
  const isModified = script.periodModifier !== PeriodModifiers.None
  return script.period === Periods.None ? (
    <></>
  ) : (
    <ExternalLink
      className={'subtle-link'}
      href={
        `/library/search/?scriptPeriod=${encodeURIComponent(
          script.period.name,
        )}` +
        (isModified
          ? `&scriptPeriodModifier=${encodeURIComponent(
              script.periodModifier.name,
            )}`
          : '')
      }
    >
      {isModified && script.periodModifier.name} {script.period.name}{' '}
      {script.uncertain ? '(?)' : ''}
    </ExternalLink>
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
  const target = useRef<HTMLButtonElement | null>(null)
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
      <Popover.Body>
        <Select
          aria-label="select-period"
          options={options}
          value={{
            value: updates.period.name,
            label: updates.period.name,
          }}
          onChange={updatePeriod}
          isSearchable={true}
          className={'script-selection__selection'}
          autoFocus={true}
        />
        <Select
          aria-label="select-period-modifier"
          options={modifierOptions}
          value={{
            value: updates.periodModifier.name,
            label: updates.periodModifier.name,
          }}
          onChange={updatePeriodModifier}
          isSearchable={true}
          className={'script-selection__selection'}
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
                    .then(() => setScript(updates)),
                )
              }
            }}
          >
            Save
          </Button>
          <Spinner loading={isSaving}>Saving...</Spinner>
        </div>
      </Popover.Body>
    </Popover>
  )

  return (
    <div>
      Script: {script.period === Periods.None && '-'}
      <MetaEditButton
        aria-label="Edit script button"
        buttonRef={target}
        onClick={() => {
          setUpdates(script)
          setIsDisplayed(true)
        }}
      />
      <Overlay
        target={target.current}
        placement="right"
        show={isDisplayed}
        rootClose={true}
        rootCloseEvent={'click'}
        onHide={() => setIsDisplayed(false)}
      >
        {popover}
      </Overlay>
      <div className="script-selection__button-wrapper">
        <ScriptInfo script={script} />
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
  (props) => props.fragmentService.fetchPeriods(),
)
