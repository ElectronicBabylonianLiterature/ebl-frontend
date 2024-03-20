import { BrokenUncertainProps } from 'common/BrokenAndUncertain'
import React from 'react'
import { Form } from 'react-bootstrap'

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
