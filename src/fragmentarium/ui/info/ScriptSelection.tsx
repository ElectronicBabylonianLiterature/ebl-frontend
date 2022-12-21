import { Fragment, Script } from 'fragmentarium/domain/fragment'
import React, { ReactNode, useState, useRef } from 'react'
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
import { usePrevious } from 'common/usePrevious'
import { Button, Overlay, Popover } from 'react-bootstrap'
import classNames from 'classnames'

type Props = {
  fragment: Fragment
  updateScript: (script: Script) => void
  periodOptions: readonly Period[]
}

function ScriptSelection({
  fragment,
  updateScript,
  periodOptions,
}: Props): JSX.Element {
  const [script, setScript] = useState<Script>(fragment.script)
  const [isDisplayed, setIsDisplayed] = useState(false)
  const target = useRef(null)
  const prevScript = usePrevious(script)

  function updatePeriod(event) {
    const period = Periods[event.value]
    setScript({ ...script, period: period })
  }

  function updatePeriodModifier(event) {
    const modifier = PeriodModifiers[event.value]
    setScript({ ...script, periodModifier: modifier })
  }

  function updateIsUncertain() {
    setScript({ ...script, uncertain: !script.uncertain })
  }

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
            value: script.periodModifier.name,
            label: script.periodModifier.name,
          }}
          onChange={updatePeriodModifier}
          isSearchable={true}
          autoFocus={false}
        />
        <Select
          aria-label="select-period"
          options={options}
          value={{
            value: script.period.name,
            label: script.period.name,
          }}
          onChange={updatePeriod}
          isSearchable={true}
          autoFocus={false}
        />
        <input
          type="checkbox"
          checked={script.uncertain}
          onChange={updateIsUncertain}
        />
        &nbsp;Uncertain
      </Popover.Content>
    </Popover>
  )

  return (
    <div>
      Script:
      <SessionContext.Consumer>
        {(session: Session): ReactNode =>
          session.isAllowedToTransliterateFragments() && (
            <Button
              aria-label="Browse genres button"
              variant="light"
              ref={target}
              className={classNames(['float-right', 'far fa-edit', 'mh-100'])}
              onClick={() => setIsDisplayed(true)}
            />
          )
        }
      </SessionContext.Consumer>
      <Overlay
        target={target.current}
        placement="right"
        show={isDisplayed}
        rootClose={true}
        rootCloseEvent={'click'}
        onHide={() => {
          setIsDisplayed(false)
          if (script !== prevScript && !_.isNil(prevScript)) {
            updateScript(script)
          }
        }}
      >
        {popover}
      </Overlay>
      <br />
      {fragment.script.periodModifier !== PeriodModifiers.None &&
        fragment.script.periodModifier.name}{' '}
      {fragment.script.period !== Periods.None && fragment.script.period.name}{' '}
      {fragment.script.uncertain ? '(?)' : ''}
    </div>
  )
}

export default withData<
  { fragment: Fragment; updateScript: (script: Script) => void },
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
