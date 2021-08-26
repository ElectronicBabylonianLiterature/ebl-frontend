import _ from 'lodash'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import { Token } from 'transliteration/domain/token'
import { Text } from 'transliteration/domain/text'
import SignService from 'signs/application/SignService'
import Bluebird from 'bluebird'
import Sign from 'signs/domain/Sign'

export class AnnotationToken {
  readonly value: string
  readonly path: readonly number[]
  readonly sign: Sign | undefined
  readonly enabled: boolean

  constructor(
    value: string,
    path: readonly number[],
    enabled: boolean,
    sign: Sign | undefined = undefined
  ) {
    this.value = value
    this.path = path
    this.sign = sign
    this.enabled = enabled
  }

  hasMatchingPath(annotation: RawAnnotation | readonly Annotation[]): boolean {
    if (Array.isArray(annotation)) {
      return Boolean(
        _.find(annotation, (singleAnnotation) =>
          _.isEqual(singleAnnotation.data.path, this.path)
        )
      )
    } else {
      return _.isEqual(this.path, (annotation as RawAnnotation).data?.path)
    }
  }
}

async function mapToken(
  token: Token,
  path: readonly number[],
  signService: SignService
): Bluebird<AnnotationToken | AnnotationToken[]> {
  async function findSignName(value, subIndex): Bluebird<Sign> {
    const signs = await Bluebird.all(
      signService.search({ value: value, subIndex: subIndex })
    )
    if (signs.length) {
      return signs[0]
    } else {
      throw Error(
        `No Sign corresponding to reading:'${value}' and subIndex:'${subIndex}'`
      )
    }
  }

  async function _mapToken(token: Token, path: readonly number[]) {
    if (token.type === 'Reading' || token.type === 'Logogram') {
      return new AnnotationToken(
        token.value,
        path,
        true,
        await findSignName(token.name.toLowerCase(), token.subIndex)
      )
    } else if (token.type === 'CompoundGrapheme') {
      return new AnnotationToken(token.value, path, true)
    } else if (token.parts) {
      return Bluebird.all(
        token.parts.flatMap((part: Token, index: number) =>
          _mapToken(part, [...path, index])
        )
      )
    } else {
      return new AnnotationToken(token.value, path, false)
    }
  }
  return _mapToken(token, path)
}

export async function createAnnotationTokens(
  text: Text,
  signService: SignService
): Bluebird<readonly AnnotationToken[][]> {
  const tokens = await Bluebird.all(
    text.lines.map(async (line, lineNumber) => [
      new AnnotationToken(line.prefix, [lineNumber], false),
      ...(await Bluebird.all(
        line.content.flatMap((token, index) =>
          mapToken(token, [lineNumber, index], signService)
        )
      )),
    ])
  )
  return Bluebird.map(tokens, (token) => _.flattenDeep(token))
}
