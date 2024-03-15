import React from 'react'
import { Form } from 'react-bootstrap'

export interface BrokenUncertainProps {
  name: string
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
  isBroken = false,
  isUncertain = false,
  setBroken,
  setUncertain,
}: BrokenUncertainProps): JSX.Element {
  return (
    <>
      <Form.Switch
        label={`Broken`}
        id={`${name}_broken`}
        data-testid={`${name}-broken-switch`}
        style={{ marginLeft: '10px' }}
        onChange={(event) => setBroken(event.target.checked)}
        checked={isBroken}
      />
      <Form.Switch
        label={`Uncertain`}
        id={`${name}_uncertain`}
        data-testid={`${name}-uncertain-switch`}
        style={{ marginLeft: '10px' }}
        onChange={(event) => setUncertain(event.target.checked)}
        checked={isUncertain}
      />
    </>
  )
}
