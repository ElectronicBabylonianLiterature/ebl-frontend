import { Fragment, Script } from 'fragmentarium/domain/fragment'
import React, { ReactNode, useState, useEffect } from 'react'
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

  useEffect(() => {
    if (script !== prevScript && !_.isNil(prevScript)) {
      updateScript(script)
    }
  }, [prevScript, script, updateScript])

  const modifierOptions = periodModifiers.map((modifier) => ({
    value: modifier.name,
    label: modifier.name,
  }))

  const options = periodOptions.map((period: Period) => ({
    value: period.name,
    label: period.name,
  }))

  return (
    <div>
      Script:
      <SessionContext.Consumer>
        {(session: Session): ReactNode =>
          session.isAllowedToTransliterateFragments() && (
            <>
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
            </>
          )
        }
      </SessionContext.Consumer>
      <>
        <br />
        {script.periodModifier !== PeriodModifiers.None &&
          script.periodModifier.name}{' '}
        {script.period !== Periods.None && script.period.name}{' '}
        {script.uncertain ? '(?)' : ''}
      </>
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
