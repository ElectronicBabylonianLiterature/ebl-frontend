import React from 'react'
import { Form, Row } from 'react-bootstrap'
import { IndividualAttestation, IndividualType } from './ColophonEditor'
import _ from 'lodash'
import ListForm from 'common/List'
import { BrokenAndUncertainSwitches } from 'common/BrokenAndUncertain'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import FragmentService from 'fragmentarium/application/FragmentService'
import ProvenanceSearchForm from '../ProvenanceSearchForm'
import { Provenances } from 'corpus/domain/provenance'

export const ColophonIndividualsInput = ({
  fragmentService,
  onChange,
  label = 'Individuals',
  collapsed = false,
  individuals = [new IndividualAttestation()],
}: {
  fragmentService: FragmentService
  onChange
  label?: string
  collapsed?: boolean
  individuals?: ReadonlyArray<IndividualAttestation>
}): JSX.Element => {
  const _individuals =
    individuals.length > 0 ? individuals : [new IndividualAttestation()]
  return (
    <ListForm
      value={_individuals}
      onChange={onChange}
      label={label}
      noun="Individual"
      defaultValue={_individuals}
      collapsed={collapsed}
    >
      {() =>
        _individuals.map((individual, index) => {
          return (
            <IndividualForm
              fragmentService={fragmentService}
              onChange={onChange}
              individual={individual}
              key={index}
            />
          )
        })
      }
    </ListForm>
  )
}

type IndividualFieldName = 'type' | 'name' | 'sonOf' | 'grandsonOf' | 'family'

const getValueAndOptionsByKey = async (
  key: IndividualFieldName,
  individual: IndividualAttestation,
  fragmentService: FragmentService
): Promise<{
  options: readonly { value: string; label: string }[]
  value: { value: string; label: string }
}> =>
  key === 'type'
    ? {
        value: { value: individual[key] ?? '', label: individual[key] ?? '' },
        options: Object.values(IndividualType).map((type) => ({
          value: type ?? '',
          label: type ?? '',
        })),
      }
    : {
        value: {
          value: individual[key]?.value ?? '',
          label: individual[key]?.value ?? '',
        },
        options: await fragmentService
          .fetchColophonNames('ToDo: add query here')
          .then((names) => names.map((name) => ({ value: name, label: name }))),
      }

const IndividualForm = ({
  fragmentService,
  onChange,
  individual,
}: {
  fragmentService: FragmentService
  onChange
  individual: IndividualAttestation
}): JSX.Element => {
  const nameFields = ['name', 'sonOf', 'grandsonOf', 'family']
  const getSelectField = (props, key: string) => {
    return key === 'nativeOf' ? (
      <ProvenanceSearchForm
        fragmentService={fragmentService}
        onChange={(value) => {
          individual.setNativeOf({
            ...individual.nativeOf,
            value: value && Provenances[value] ? Provenances[value] : null,
          })
        }}
        value={individual?.nativeOf?.value?.name ?? null}
        placeholder="Native Of"
      />
    ) : nameFields.includes(key) ? (
      <CreatableSelect {...props} />
    ) : (
      <Select {...props} />
    )
  }
  const setBrokenOrUncertain = (
    checked: boolean,
    field: 'broken' | 'uncertain',
    keyField: 'name' | 'family' | 'sonOf' | 'grandsonOf',
    individual: IndividualAttestation
  ) => {
    individual.setNameField(keyField, {
      ...individual[keyField],
      [field]: checked,
    })
    console.log(keyField, field, individual)
  }
  const individualFields = [...nameFields, 'nativeOf', 'type'].map((key) => {
    const props = {
      onChange,
      key,
      isClearable: true,
      placeholder: _.startCase(key),
      ...getValueAndOptionsByKey(
        key as IndividualFieldName,
        individual,
        fragmentService
      ),
    }

    const getBrokenOrUncertainMethod = (field: 'broken' | 'uncertain') => (
      checked: boolean
    ) =>
      setBrokenOrUncertain(
        checked,
        field,
        key as 'name' | 'family' | 'sonOf' | 'grandsonOf',
        individual
      )

    return (
      <Form.Group key={`${key}-col`}>
        <Form.Label>{_.startCase(key)}</Form.Label>
        {getSelectField(props, key)}
        {key !== 'type' && (
          <Row key={`${key}-row`}>
            <BrokenAndUncertainSwitches
              key={`${key}-broken-uncertain`}
              name={key}
              setBroken={getBrokenOrUncertainMethod('broken')}
              setUncertain={getBrokenOrUncertainMethod('uncertain')}
            />
          </Row>
        )}
      </Form.Group>
    )
  })
  return <>{individualFields}</>
}
