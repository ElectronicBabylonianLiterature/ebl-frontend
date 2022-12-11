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
  PeriodModifier,
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
  const [period, setPeriod] = useState<Period>(fragment.script.period)
  const [periodModifier, setPeriodModifier] = useState<PeriodModifier>(
    fragment.script.periodModifier
  )
  const [isUncertain, setIsUncertain] = useState(false)

  const prevPeriod = usePrevious(period)
  const prevPeriodModifier = usePrevious(periodModifier)
  const prevIsUncertain = usePrevious(isUncertain)

  function updatePeriod(event) {
    const period = Periods[event.value]
    setPeriod(period)
  }

  function updatePeriodModifier(event) {
    const modifier = PeriodModifiers[event.value]
    setPeriodModifier(modifier)
  }

  function updateIsUncertain() {
    setIsUncertain(!isUncertain)
  }

  useEffect(() => {
    if (
      prevPeriod !== period ||
      prevPeriodModifier !== periodModifier ||
      prevIsUncertain !== isUncertain
    ) {
      const newScript = {
        period: period,
        periodModifier: periodModifier,
        uncertain: isUncertain,
      }
      updateScript(newScript)
    }
  }, [
    isUncertain,
    period,
    periodModifier,
    prevIsUncertain,
    prevPeriod,
    prevPeriodModifier,
    updateScript,
  ])

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
                  value: periodModifier.name,
                  label: periodModifier.name,
                }}
                onChange={updatePeriodModifier}
                isSearchable={true}
                autoFocus={false}
              />
              <Select
                aria-label="select-period"
                options={options}
                value={{
                  value: period.name,
                  label: period.name,
                }}
                onChange={updatePeriod}
                isSearchable={true}
                autoFocus={false}
              />
              <input
                type="checkbox"
                checked={isUncertain}
                onChange={updateIsUncertain}
              />
              &nbsp;Uncertain
            </>
          )
        }
      </SessionContext.Consumer>
      <>
        <br />
        {periodModifier !== PeriodModifiers.None && periodModifier.name}{' '}
        {period !== Periods.None && period.name} {isUncertain ? '(?)' : ''}
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
