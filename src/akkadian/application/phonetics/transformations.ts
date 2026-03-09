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
  consonant: string,
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
  phoneticProps: PhoneticProps,
): Transformations | null {
  const record: TransformationRecord[] = []
  if (/^.*n$/.test(transcription) && phoneticProps.wordContext?.nextWord) {
    const sandhiNAssimilationRecord = sandhiNAssimilation(
      transcription,
      phoneticProps.wordContext.nextWord.cleanValue[0],
    )
    record.push(sandhiNAssimilationRecord)
    return {
      transformedForm: sandhiNAssimilationRecord.transformedForm,
      record: record,
    }
  }
  return null
}
