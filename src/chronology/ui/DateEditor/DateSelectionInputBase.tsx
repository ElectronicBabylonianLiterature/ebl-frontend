import React from 'react'
import _ from 'lodash'
import { Form } from 'react-bootstrap'

export interface BrokenUncertainProps {
  name: string
  isBroken: boolean
  isUncertain: boolean
  setBroken: React.Dispatch<React.SetStateAction<boolean>>
  setUncertain: React.Dispatch<React.SetStateAction<boolean>>
}

export interface InputGroupProps extends BrokenUncertainProps {
  value: string
  isIntercalary?: boolean
  setValue: React.Dispatch<React.SetStateAction<string>>
  setIntercalary?: React.Dispatch<React.SetStateAction<boolean>>
}

type RadioButtonProps = {
  id: string
  label: string
  name: string
  checked: boolean
  onChange: () => void
}

export const RadioButton = ({
  id,
  label,
  name,
  checked,
  onChange,
}: RadioButtonProps): JSX.Element => (
  <Form.Check
    inline
    type="radio"
    id={id}
    label={label}
    name={name}
    checked={checked}
    onChange={onChange}
  />
)

export function getBrokenAndUncertainSwitches({
  name,
  isBroken,
  isUncertain,
  setBroken,
  setUncertain,
}: BrokenUncertainProps): JSX.Element {
  return (
    <>
      <Form.Switch
        label={`${_.startCase(name)}-Broken`}
        id={`${name}_broken`}
        style={{ marginLeft: '10px' }}
        onChange={(event) => setBroken(event.target.checked)}
        checked={isBroken}
      />
      <Form.Switch
        label={`${_.startCase(name)}-Uncertain`}
        id={`${name}_uncertain`}
        style={{ marginLeft: '10px' }}
        onChange={(event) => setUncertain(event.target.checked)}
        checked={isUncertain}
      />
    </>
  )
}
