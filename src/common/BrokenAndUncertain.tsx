import _ from 'lodash'
import React from 'react'
import { Form } from 'react-bootstrap'

export interface BrokenUncertainProps {
  name: string
  id?: string | number
  isBroken?: boolean
  isUncertain?: boolean
  setBroken:
    | React.Dispatch<React.SetStateAction<boolean>>
    | ((isBroken: boolean) => void)
  setUncertain:
    | React.Dispatch<React.SetStateAction<boolean>>
    | ((isUncertain: boolean) => void)
}

export function BrokenAndUncertainSwitches(
  props: BrokenUncertainProps
): JSX.Element {
  return (
    <>
      {getSwitch('broken', props)}
      {getSwitch('uncertain', props)}
    </>
  )
}

function getSwitch(
  type: 'broken' | 'uncertain',
  props: BrokenUncertainProps
): JSX.Element {
  const { name, id } = props
  const onChange = props[`set${_.capitalize(type)}`]
  const checked = props[`is${_.capitalize(type)}`]
  const _id = id ?? 0
  return (
    <Form.Switch
      label={_.capitalize(type)}
      id={`${_id}-${name}_${type}`}
      aria-label={`${_id}-${name}-${type}-switch`}
      data-testid={`${_id}-${name}-${type}-switch`}
      style={{ marginLeft: '10px' }}
      onChange={(event) => onChange(event.target.checked)}
      checked={checked}
    />
  )
}
