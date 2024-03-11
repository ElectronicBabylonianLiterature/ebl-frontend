import React, { FormEvent, useState } from 'react'
import { Form, Button, Row } from 'react-bootstrap'
import { Provenance } from 'corpus/domain/provenance'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  ColophonOwnershipInput,
  ColophonStatusInput,
  ColophonTypeInput,
  ColophonOriginalFromInput,
  ColophonWrittenInInput,
} from './ColophonEditorInputs'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ColophonIndividualsInput } from './ColophonEditorIndividualInput'
import produce, { Draft, castDraft, immerable } from 'immer'

export enum ColophonStatus {
  Yes = 'Yes',
  No = 'No',
  Broken = 'Broken',
  OnlyColophon = 'Only Colophon',
}

export enum ColophonType {
  AsbA = 'Asb a',
  AsbB = 'Asb b',
  AsbC = 'Asb c',
  AsbD = 'Asb d',
  AsbE = 'Asb e',
  AsbF = 'Asb f',
  AsbG = 'Asb g BAK 321',
  AsbH = 'Asb h',
  AsbI = 'Asb i',
  AsbK = 'Asb k',
  AsbL = 'Asb l',
  AsbM = 'Asb m',
  AsbN = 'Asb n',
  AsbO = 'Asb o',
  AsbP = 'Asb p',
  AsbQ = 'Asb q',
  AsbRS = 'Asb r/s',
  AsbT = 'Asb t',
  AsbU = 'Asb u',
  AsbV = 'Asb v',
  AsbW = 'Asb w',
  AsbUnclear = 'Asb Unclear',
  NzkBAK293 = 'Nzk BAK 293',
  NzkBAK294 = 'Nzk BAK 294',
  NzkBAK295 = 'Nzk BAK 295',
  NzkBAK296 = 'Nzk BAK 296',
  NzkBAK297 = 'Nzk BAK 297',
}

export enum ColophonOwnership {
  Library = 'Library',
  Private = 'Private',
  Individual = 'Individual',
}

export enum IndividualType {
  Owner = 'Owner',
  Scribe = 'Scribe',
  Other = 'Other',
}

export interface NameAttestation {
  value?: string
  isBroken?: boolean
  isUncertain?: boolean
}

export interface ProvenanceAttestation {
  value?: Provenance
  isBroken?: boolean
  isUncertain?: boolean
}

export interface IndividualTypeAttestation {
  value?: IndividualType
  isBroken?: boolean
  isUncertain?: boolean
}

export class IndividualAttestation {
  readonly [immerable] = true

  constructor(
    readonly name?: NameAttestation,
    readonly sonOf?: NameAttestation,
    readonly grandsonOf?: NameAttestation,
    readonly family?: NameAttestation,
    readonly nativeOf?: ProvenanceAttestation,
    readonly type?: IndividualType
  ) {}

  setType(type?: IndividualType): IndividualAttestation {
    return produce(this, (draft: Draft<IndividualAttestation>) => {
      draft.type = castDraft(type)
    })
  }

  setNameField(
    field: 'name' | 'sonOf' | 'grandsonOf' | 'family',
    name?: NameAttestation
  ): IndividualAttestation {
    return produce(this, (draft: Draft<IndividualAttestation>) => {
      draft[field] = castDraft(name)
    })
  }

  setNativeOf(provenance?: ProvenanceAttestation): IndividualAttestation {
    return produce(this, (draft: Draft<IndividualAttestation>) => {
      draft.nativeOf = castDraft(provenance)
    })
  }
}

export interface Colophon {
  colophonStatus: ColophonStatus
  colophonOwnership?: ColophonOwnership
  colophonType?: ColophonType
  originalFrom?: ProvenanceAttestation
  writtenIn?: ProvenanceAttestation
  notesToScribalProcess?: string
  individuals?: IndividualAttestation[]
}

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
  // ToDo: Implement commented out
  //const { colophon } = fragment
  const [formData, setFormData] = useState<Colophon>({
    colophonStatus: ColophonStatus.No, //colophon?.colophonStatus || ColophonStatus.No,
    colophonOwnership: ColophonOwnership.Library, //fragment.colophon?.colophonOwnership || ColophonOwnership.Library,
    colophonType: ColophonType.AsbA, //fragment.colophon?.colophonType,
    originalFrom: undefined, //colophon?.originalFrom,
    writtenIn: undefined, //colophon?.writtenIn,
    notesToScribalProcess: undefined, //colophon?.notesToScribalProcess,
    individuals: [], //colophon?.individuals,
  })
  const [error, setError] = useState<Error | null>(null)

  /*
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }
  */

  const handleSelectChange = (name: string) => (selectedOption: any) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: selectedOption?.value,
    }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    try {
      await updateColophon(formData)
    } catch (error) {
      setError(error as Error)
    }
  }

  return (
    <Form onSubmit={submit}>
      <Row>
        <ColophonStatusInput
          colophonStatus={formData.colophonStatus}
          onChange={handleSelectChange}
        />
      </Row>
      <Row>
        <ColophonTypeInput
          colophonType={formData.colophonType}
          onChange={handleSelectChange('colophonType')}
        />
      </Row>
      <Row>
        <ColophonOwnershipInput
          colophonOwnership={formData.colophonOwnership}
          onChange={handleSelectChange}
        />
      </Row>
      <Row>
        <ColophonOriginalFromInput
          originalFrom={formData.originalFrom}
          onChange={handleSelectChange}
          fragmentService={fragmentService}
        />
      </Row>
      <Row>
        <ColophonWrittenInInput
          writtenIn={formData.writtenIn}
          onChange={handleSelectChange}
          fragmentService={fragmentService}
        />
      </Row>
      <ColophonIndividualsInput
        individuals={formData.individuals}
        onChange={handleSelectChange}
        searchIndividuals={() => {
          const empty: readonly IndividualAttestation[] = []
          return new Promise(() => empty)
        }}
      />
      <Button
        variant="primary"
        type="submit"
        disabled={disabled || error !== null}
      >
        Save
      </Button>
    </Form>
  )
}

export default ColophonEditor
