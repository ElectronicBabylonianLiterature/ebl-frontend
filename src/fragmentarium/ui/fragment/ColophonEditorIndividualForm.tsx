import React, { useState } from 'react'
import { Accordion, Form, Row } from 'react-bootstrap'
import {
  Colophon,
  IndividualAttestation,
  IndividualType,
} from 'fragmentarium/domain/Colophon'
import _ from 'lodash'
import ListForm from 'common/ui/List'
import { BrokenAndUncertainSwitches } from 'common/ui/BrokenAndUncertain'
import FragmentService from 'fragmentarium/application/FragmentService'
import { getSelectField } from './ColophonEditorIndividualInputs'
import Bluebird from 'bluebird'

const colophonSuggestionDebounceMilliseconds = 250
const colophonSuggestionMinimumLength = 2

export interface IndividualProps {
  fragmentService: FragmentService
  individual: IndividualAttestation
  index: number
  onChange: (individual: IndividualAttestation, index: number) => void
}

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
      <Accordion.Item eventKey={index.toString()}>
        <Accordion.Header>
          {`Individual ${index + 1}. ${individual.toString()}`}
        </Accordion.Header>
        <Accordion.Body>
          <IndividualForm
            index={index}
            fragmentService={fragmentService}
            onChange={(_individual: IndividualAttestation, index: number) => {
              const _individuals = [...individuals]
              _individuals[index] = _individual
              setIndividuals(_individuals)
              onChange('individuals', _individuals)
            }}
            individual={individual}
            key={index}
          />
        </Accordion.Body>
      </Accordion.Item>
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

const setBrokenOrUncertain = (
  checked: boolean,
  field: 'isBroken' | 'isUncertain',
  keyField: 'name' | 'family' | 'sonOf' | 'grandsonOf' | 'type',
  individual: IndividualAttestation,
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

const getIndividualField = ({
  individualProps,
  key,
}: {
  individualProps: IndividualProps
  key: string
}): JSX.Element => {
  const { individual, fragmentService, onChange, index } = individualProps
  const fieldProps = getValueAndOptionsByKey(
    key as IndividualFieldName,
    individual,
    fragmentService,
  )
  const props = {
    onChange,
    key,
    isClearable: true,
    placeholder: _.startCase(key),
    ...fieldProps,
  }

  const getBrokenOrUncertainMethod =
    (field: 'isBroken' | 'isUncertain') => (checked: boolean) => {
      const _individual = setBrokenOrUncertain(
        checked,
        field,
        key as 'name' | 'family' | 'sonOf' | 'grandsonOf' | 'type',
        individual,
      )
      onChange(_individual, index)
    }

  return (
    <Form.Group key={`${key}-col`}>
      <Form.Label>{_.startCase(key)}</Form.Label>
      {getSelectField({ key, individualProps, props })}
      <Row key={`${key}-row`}>
        <BrokenAndUncertainSwitches
          key={`${key}-broken-uncertain`}
          name={key}
          id={index}
          setBroken={getBrokenOrUncertainMethod('isBroken')}
          setUncertain={getBrokenOrUncertainMethod('isUncertain')}
          isBroken={individual[key]?.isBroken}
          isUncertain={individual[key]?.isUncertain}
        />
      </Row>
    </Form.Group>
  )
}

const IndividualForm = (individualProps: IndividualProps): JSX.Element => {
  const individualFieldNames = [
    'name',
    'sonOf',
    'grandsonOf',
    'family',
    'nativeOf',
    'type',
  ]
  return (
    <>
      {individualFieldNames.map((key) =>
        getIndividualField({ individualProps, key }),
      )}
    </>
  )
}

const getValueAndOptionsByKey = (
  key: IndividualFieldName,
  individual: IndividualAttestation,
  fragmentService: FragmentService,
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

export const getLoadOptionsMethod = (fragmentService: FragmentService) => {
  const loadState = createColophonLoadState()

  return (
    inputValue: string,
    callback: (options: ColophonNameOption[]) => void,
  ): Bluebird<void> => {
    const normalizedInput = inputValue.trim()
    const requestId = loadState.requestSequence + 1
    loadState.requestSequence = requestId
    clearPendingColophonLoad(loadState)

    if (normalizedInput.length < colophonSuggestionMinimumLength) {
      callback([])
      return Bluebird.resolve()
    }

    return scheduleColophonLoad(
      fragmentService,
      loadState,
      normalizedInput,
      requestId,
      callback,
    )
  }
}

type ColophonNameOption = {
  value: string
  label: string
}

type ColophonLoadState = {
  requestSequence: number
  pendingTimeout: ReturnType<typeof setTimeout> | null
  pendingResolve: (() => void) | null
}

function createColophonLoadState(): ColophonLoadState {
  return {
    requestSequence: 0,
    pendingTimeout: null,
    pendingResolve: null,
  }
}

function clearPendingColophonLoad(loadState: ColophonLoadState): void {
  if (loadState.pendingTimeout) {
    clearTimeout(loadState.pendingTimeout)
    loadState.pendingTimeout = null
  }

  if (loadState.pendingResolve) {
    loadState.pendingResolve()
    loadState.pendingResolve = null
  }
}

function createColophonNameOptions(
  entries: readonly string[],
): ColophonNameOption[] {
  return entries.map((value) => ({
    value,
    label: value,
  }))
}

function scheduleColophonLoad(
  fragmentService: FragmentService,
  loadState: ColophonLoadState,
  normalizedInput: string,
  requestId: number,
  callback: (options: ColophonNameOption[]) => void,
): Bluebird<void> {
  return new Bluebird<void>((resolve) => {
    loadState.pendingResolve = resolve
    loadState.pendingTimeout = setTimeout(() => {
      loadState.pendingTimeout = null
      loadState.pendingResolve = null

      fragmentService
        .fetchColophonNames(normalizedInput)
        .then((entries) => {
          if (loadState.requestSequence !== requestId) {
            return
          }

          callback(createColophonNameOptions(entries))
        })
        .catch(() => {
          if (loadState.requestSequence === requestId) {
            callback([])
          }
        })
        .finally(resolve)
    }, colophonSuggestionDebounceMilliseconds)
  })
}
