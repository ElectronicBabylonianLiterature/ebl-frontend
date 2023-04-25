import { PhoneticProps } from 'akkadian/application/phonetics/segments'

export interface TransformationRecord {
  readonly transformation: string
  readonly initialForm: string
  readonly transformedForm: string
  readonly isSandhi: boolean
}

export interface Transformations {
  readonly transformedForm: string
  readonly record: TransformationRecord[]
}

function sandhiNAssimilation(
  transcription: string,
  consonant: string
): TransformationRecord {
  return {
    transformation: `assimilation: nC>CC`,
    initialForm: transcription,
    transformedForm: transcription.replace(/.$/, consonant),
    isSandhi: true,
  }
}

export function getSandhiTransformations(
  transcription: string,
  phoneticProps: PhoneticProps
): Transformations | null {
  const record: TransformationRecord[] = []
  let transformedForm = transcription
  if (/.*n$/.test(transcription) && phoneticProps.wordContext?.nextWord) {
    const transformationsRecord = sandhiNAssimilation(
      transformedForm,
      phoneticProps.wordContext.nextWord.cleanValue[0]
    )
    transformedForm = transformationsRecord.transformedForm
    record.push(transformationsRecord)
  }
  if (transformedForm !== transcription) {
    return {
      transformedForm: transformedForm,
      record: record,
    }
  }
  return null
}
