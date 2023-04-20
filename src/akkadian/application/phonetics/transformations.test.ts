import { applySandhiTransformations } from 'akkadian/application/phonetics/transformations'
import { PhoneticProps } from 'akkadian/application/phonetics/segments'
import { kurToken } from 'test-support/test-tokens'

test.each([['in', 'ik', { wordContext: { nextWord: kurToken } }]])(
  'Test transformations',
  (transcription: string, expected: string, phoneticProps: PhoneticProps) => {
    const result = applySandhiTransformations(transcription, phoneticProps)
    expect(result?.transformedForm).toEqual(expected)
  }
)
