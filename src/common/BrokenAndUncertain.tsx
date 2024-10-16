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

export function BrokenAndUncertainSwitches({
  name,
  id = 0,
  isBroken = false,
  isUncertain = false,
  setBroken,
  setUncertain,
}: BrokenUncertainProps): JSX.Element {
  return (
    <>
      <Form.Switch
        label={`Broken`}
        id={`${id}-${name}_broken`}
        aria-label={`${id}-${name}-broken-switch`}
        data-testid={`${id}-${name}-broken-switch`}
        style={{ marginLeft: '10px' }}
        onChange={(event) => setBroken(event.target.checked)}
        checked={isBroken}
      />
      <Form.Switch
        label={`Uncertain`}
        id={`${id}-${name}_uncertain`}
        aria-label={`${id}-${name}-uncertain-switch`}
        data-testid={`${id}-${name}-uncertain-switch`}
        style={{ marginLeft: '10px' }}
        onChange={(event) => setUncertain(event.target.checked)}
        checked={isUncertain}
      />
    </>
  )
}
