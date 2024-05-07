import React, { useState } from 'react'
import { Accordion, Button, Form, Row } from 'react-bootstrap'
import Select from 'react-select'
import AsyncCreatableSelect from 'react-select/async-creatable'
import {
  Colophon,
  IndividualAttestation,
  IndividualType,
} from './ColophonEditor'
import _ from 'lodash'
import ListForm from 'common/List'
import { BrokenAndUncertainSwitches } from 'common/BrokenAndUncertain'
import FragmentService from 'fragmentarium/application/FragmentService'
import ProvenanceSearchForm from '../ProvenanceSearchForm'

export const ColophonIndividualsInput = ({
  fragmentService,
  onChange,
  label = 'Individuals',
  collapsed = false,
  individualsProp = [],
}: {
  fragmentService: FragmentService
  onChange: (field: keyof Colophon, value) => void
  label?: string
  collapsed?: boolean
  individualsProp?: ReadonlyArray<IndividualAttestation>
}): JSX.Element => {
  const [individuals, setIndividuals] = useState([...individualsProp])
  const getFormFields = (individual, _onChange, index) => (
    <Accordion key={index}>
      <Accordion.Toggle as={Button} variant="link" eventKey={index.toString()}>
        {`Individual ${index + 1}. ${individual.toString()}`}
      </Accordion.Toggle>
      <Accordion.Collapse eventKey={index.toString()}>
        <IndividualForm
          index={index}
          fragmentService={fragmentService}
          onChange={(_individual, index) => {
            const _individuals = [...individuals]
            _individuals[index] = _individual
            setIndividuals(_individuals)
            onChange('individuals', _individuals)
          }}
          individual={individual}
          key={index}
        />
      </Accordion.Collapse>
    </Accordion>
  )
  return (
    <ListForm
      value={individuals}
      onChange={(_individuals: IndividualAttestation[]) => {
        setIndividuals(_individuals)
        onChange('individuals', _individuals)
      }}
      label={label}
      noun="Individual"
      defaultValue={new IndividualAttestation({})}
      collapsed={collapsed}
    >
      {getFormFields}
    </ListForm>
  )
}

type IndividualFieldName = 'type' | 'name' | 'sonOf' | 'grandsonOf' | 'family'

const getLoadOptionsMethod = (fragmentService: FragmentService) => (
  inputValue: string,
  callback: (options: { value: string; label: string }[]) => void
) =>
  fragmentService.fetchColophonNames(inputValue).then((entries) => {
    const options = entries.map((value) => ({
      value,
      label: value,
    }))
    callback(options)
  })

const getValueAndOptionsByKey = (
  key: IndividualFieldName,
  individual: IndividualAttestation,
  fragmentService: FragmentService
): {
  value?: { value: string; label: string }
  options?: readonly { value: string; label: string }[]
  loadOptions?
  handleChange?
} => {
  return {
    ...(individual[key]?.value && {
      value: {
        value: individual[key]?.value as string,
        label: individual[key]?.value as string,
      },
    }),
    ...(key === 'type' && {
      options: Object.values(IndividualType).map((type) => ({
        value: type,
        label: type,
      })),
    }),
    ...(key !== 'type' && {
      loadOptions: getLoadOptionsMethod(fragmentService),
    }),
  }
}

const IndividualForm = ({
  fragmentService,
  onChange,
  individual,
  index,
}: {
  fragmentService: FragmentService
  onChange: (individual: IndividualAttestation, index: number) => void
  individual: IndividualAttestation
  index: number
}): JSX.Element => {
  const nameFields = ['name', 'sonOf', 'grandsonOf', 'family']
  const getSelectField = (props, key: string) => {
    return key === 'nativeOf' ? (
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
      />
    ) : nameFields.includes(key) ? (
      <AsyncCreatableSelect
        allowCreateWhileLoading
        cacheOptions={true}
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
    ) : (
      <Select
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
  }
  const setBrokenOrUncertain = (
    checked: boolean,
    field: 'isBroken' | 'isUncertain',
    keyField: 'name' | 'family' | 'sonOf' | 'grandsonOf' | 'type',
    individual: IndividualAttestation
  ): IndividualAttestation => {
    if (keyField === 'type') {
      return individual.setTypeField({
        ...individual[keyField],
        [field]: checked,
      })
    } else {
      return individual.setNameField(keyField, {
        ...individual[keyField],
        [field]: checked,
      })
    }
  }
  const individualFields = [...nameFields, 'nativeOf', 'type'].map((key) => {
    const fieldProps = getValueAndOptionsByKey(
      key as IndividualFieldName,
      individual,
      fragmentService
    )
    const props = {
      onChange,
      key,
      isClearable: true,
      placeholder: _.startCase(key),
      ...fieldProps,
    }

    const getBrokenOrUncertainMethod = (field: 'isBroken' | 'isUncertain') => (
      checked: boolean
    ) => {
      const _individual = setBrokenOrUncertain(
        checked,
        field,
        key as 'name' | 'family' | 'sonOf' | 'grandsonOf' | 'type',
        individual
      )
      onChange(_individual, index)
    }

    return (
      <Form.Group key={`${key}-col`}>
        <Form.Label>{_.startCase(key)}</Form.Label>
        {getSelectField(props, key)}
        <Row key={`${key}-row`}>
          <BrokenAndUncertainSwitches
            key={`${key}-broken-uncertain`}
            name={key}
            setBroken={getBrokenOrUncertainMethod('isBroken')}
            setUncertain={getBrokenOrUncertainMethod('isUncertain')}
            isBroken={individual[key]?.isBroken}
            isUncertain={individual[key]?.isUncertain}
          />
        </Row>
      </Form.Group>
    )
  })
  return <>{individualFields}</>
}
