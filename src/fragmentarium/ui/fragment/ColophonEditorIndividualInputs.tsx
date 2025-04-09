import React from 'react'
import Select from 'react-select'
import AsyncCreatableSelect from 'react-select/async-creatable'
import { IndividualType } from 'fragmentarium/domain/Colophon'
import ProvenanceSearchForm from '../search/SearchFormProvenance'
import { IndividualProps } from './ColophonEditorIndividualForm'

export const getSelectField = ({
  key,
  individualProps,
  props,
}: {
  key: string
  individualProps: IndividualProps
  props
}): JSX.Element => {
  return key === 'nativeOf'
    ? getProvenanceSearchForm(individualProps, key)
    : ['name', 'sonOf', 'grandsonOf', 'family'].includes(key)
    ? getNameSearchForm(props, individualProps, key)
    : getSelectForm(props, individualProps, key)
}

const getProvenanceSearchForm = (
  individualProps: IndividualProps,
  key: string
): JSX.Element => {
  const { fragmentService, individual, onChange, index } = individualProps
  return (
    <ProvenanceSearchForm
      fragmentService={fragmentService}
      onChange={(value) => {
        const _individual = individual.setNativeOf({
          ...individual.nativeOf,
          value: value ?? undefined,
        })
        onChange(_individual, index)
      }}
      value={individual?.nativeOf?.value ?? null}
      placeholder="Native Of"
      aria-label={`select-colophon-individual-${key}`}
    />
  )
}

const getNameSearchForm = (
  props,
  { index, individual }: IndividualProps,
  key: string
): JSX.Element => (
  <AsyncCreatableSelect
    allowCreateWhileLoading
    cacheOptions={true}
    aria-label={`select-colophon-individual-${key}`}
    {...{
      ...props,
      onChange: (option: { value: string; label: string }) => {
        const _individual = individual.setNameField(
          key as 'name' | 'sonOf' | 'grandsonOf' | 'family',
          { ...individual[key], value: option?.value ?? undefined }
        )
        props.onChange(_individual, index)
      },
    }}
  />
)

const getSelectForm = (
  props,
  { index, individual }: IndividualProps,
  key: string
): JSX.Element => (
  <Select
    aria-label={`select-colophon-individual-${key}`}
    {...{
      ...props,
      onChange: (option) => {
        const _individual = individual.setTypeField({
          ...individual.type,
          value: option?.value ? IndividualType[option?.value] : undefined,
        })
        props.onChange(_individual, index)
      },
    }}
  />
)
