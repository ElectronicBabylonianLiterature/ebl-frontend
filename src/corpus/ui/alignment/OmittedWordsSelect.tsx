import _ from 'lodash'
import React from 'react'
import Select, { OptionsType, ValueType } from 'react-select'
import { Token } from 'transliteration/domain/token'
import { isAnyWord } from 'transliteration/domain/type-guards'

interface OmittedWordOption {
  value: number
  label: string
}

function createOmittedWordOptions(
  reconstructionTokens: readonly Token[],
): OptionsType<OmittedWordOption> {
  return _(reconstructionTokens)
    .map((reconstructionToken, index) =>
      isAnyWord(reconstructionToken)
        ? {
            value: index,
            label: reconstructionToken.value,
          }
        : null,
    )
    .reject(_.isNull)
    .value() as OmittedWordOption[]
}

export default function OmittedWordsSelect(props: {
  label: string
  reconstructionTokens: readonly Token[]
  value: readonly number[]
  onChange: (value: number[]) => void
}): JSX.Element {
  const handleChange = (value: ValueType<OmittedWordOption, true>) => {
    props.onChange(_.isArray(value) ? value.map((option) => option.value) : [])
  }
  const options: OptionsType<OmittedWordOption> = createOmittedWordOptions(
    props.reconstructionTokens,
  )
  return (
    <Select
      aria-label={props.label}
      placeholder={props.label}
      options={options}
      value={
        props.value
          .map((index) => options.find((option) => option.value === index))
          .filter((option) => option) as OmittedWordOption[]
      }
      isMulti
      onChange={handleChange}
    />
  )
}
