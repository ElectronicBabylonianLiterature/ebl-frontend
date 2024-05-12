import React, { useState } from 'react'
import { Form, Button, Row } from 'react-bootstrap'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  ColophonOwnershipInput,
  ColophonStatusInput,
  ColophonTypeInput,
  ColophonNotesToScribalProcessInput,
  ProvenanceAttestationInput,
} from './ColophonEditorInputs'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ColophonIndividualsInput } from './ColophonEditorIndividualForm'
import { Colophon } from 'fragmentarium/domain/Colophon'

interface Props {
  fragment: Fragment
  updateColophon: (colophon: Colophon) => Promise<void>
  disabled?: boolean
  fragmentService: FragmentService
}

const ColophonEditor: React.FC<Props> = ({
  fragment,
  disabled,
  updateColophon,
  fragmentService,
}) => {
  // ToDo:
  // 3. Ensure that the form loads and dumps data correctly
  // 4. Side panel
  // 5. Tests

  const { colophon } = fragment
  const [formData, setFormData] = useState<Colophon>({
    colophonStatus: colophon?.colophonStatus,
    colophonOwnership: colophon?.colophonOwnership,
    colophonTypes: colophon?.colophonTypes,
    originalFrom: colophon?.originalFrom,
    writtenIn: colophon?.writtenIn,
    notesToScribalProcess: colophon?.notesToScribalProcess,
    individuals: colophon?.individuals,
  })
  const [error, setError] = useState<Error | null>(null)

  const handleChange = (field: keyof Colophon, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }))
  }

  const submit = async (): Promise<void> => {
    try {
      await updateColophon(formData)
    } catch (error) {
      setError(error as Error)
    }
  }

  return (
    <>
      <Form>
        <Row>
          <ColophonStatusInput
            colophonStatus={formData.colophonStatus}
            onChange={handleChange}
          />
        </Row>
        <Row>
          <ColophonTypeInput
            colophonTypes={formData.colophonTypes}
            onChange={handleChange}
          />
        </Row>
        <Row>
          <ColophonOwnershipInput
            colophonOwnership={formData.colophonOwnership}
            onChange={handleChange}
          />
        </Row>
        <Row>
          <ProvenanceAttestationInput
            {...{
              onChange: handleChange,
              fragmentService,
              fieldName: 'originalFrom',
              colophon: formData,
            }}
          />
        </Row>
        <Row>
          <ProvenanceAttestationInput
            {...{
              onChange: handleChange,
              fragmentService,
              fieldName: 'writtenIn',
              colophon: formData,
            }}
          />
        </Row>
        <ColophonIndividualsInput
          individualsProp={formData.individuals}
          onChange={handleChange}
          fragmentService={fragmentService}
        />
        <Row>
          <ColophonNotesToScribalProcessInput
            notesToScribalProcess={formData.notesToScribalProcess}
            onChange={handleChange}
          />
        </Row>
      </Form>
      <Button
        variant="primary"
        type="submit"
        aria-label="save-colophon"
        disabled={disabled || error !== null}
        onClick={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        Save
      </Button>
    </>
  )
}

export default ColophonEditor
