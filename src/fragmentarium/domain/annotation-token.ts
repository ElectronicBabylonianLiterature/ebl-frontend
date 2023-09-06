import _ from 'lodash'
import Annotation, {
  AnnotationTokenType,
  RawAnnotation,
} from 'fragmentarium/domain/annotation'
import Sign from 'signs/domain/Sign'

interface SignStripped extends Partial<Sign> {
  name: string
  displayCuneiformSigns: string
  unicode: readonly number[]
}

export class AnnotationToken {
  constructor(
    readonly value: string,
    readonly type: AnnotationTokenType,
    readonly displayValue: string,
    readonly path: readonly number[],
    readonly enabled: boolean,
    readonly sign: SignStripped | null = null,
    readonly name: string = '',
    readonly subIndex: number | null = null
  ) {}

  get hasSign(): boolean {
    return Boolean(this.sign)
  }

  attachSign(sign: SignStripped): AnnotationToken {
    return new AnnotationToken(
      this.value,
      this.type,
      this.displayValue,
      this.path,
      this.enabled,
      sign,
      this.name,
      this.subIndex
    )
  }
  static initFromTokenSign(
    value: string,
    displayValue: string,
    path: readonly number[],
    signName: string
  ): AnnotationToken {
    return new AnnotationToken(
      value,
      AnnotationTokenType.HasSign,
      displayValue,
      path,
      true,
      {
        unicode: [],
        name: signName,
        get displayCuneiformSigns(): string {
          return this.name
        },
      }
    )
  }
  static initActive(
    value: string,
    type:
      | AnnotationTokenType.HasSign
      | AnnotationTokenType.Number
      | AnnotationTokenType.PartiallyBroken
      | AnnotationTokenType.Damaged
      | AnnotationTokenType.CompoundGrapheme
      | AnnotationTokenType.SurfaceAtLine
      | AnnotationTokenType.RulingDollarLine
      | AnnotationTokenType.ColumnAtLine,
    displayValue: string,
    path: readonly number[],
    name = '',
    subIndex: number | null = null
  ): AnnotationToken {
    return new AnnotationToken(
      value,
      type,
      displayValue,
      path,
      true,
      null,
      name,
      subIndex
    )
  }
  static initDeactive(
    displayValue: string,
    type:
      | AnnotationTokenType.CompletelyBroken
      | AnnotationTokenType.Blank
      | AnnotationTokenType.Disabled,
    path: readonly number[]
  ): AnnotationToken {
    return new AnnotationToken('', type, displayValue, path, false)
  }
  static blank(): AnnotationToken {
    return new AnnotationToken('', AnnotationTokenType.Blank, 'blank', [], true)
  }
  static struct(): AnnotationToken {
    return new AnnotationToken(
      'struct',
      AnnotationTokenType.Struct,
      'struct',
      [],
      true
    )
  }
  static unclear(path): AnnotationToken {
    return new AnnotationToken(
      'x',
      AnnotationTokenType.UnclearSign,
      'x',
      path,
      true
    )
  }

  isPathInAnnotations(annotation: readonly Annotation[]): boolean {
    return Boolean(
      _.find(annotation, (singleAnnotation) =>
        _.isEqual(singleAnnotation.data.path, this.path)
      )
    )
  }

  isEqualPath(annotation: RawAnnotation | null): boolean {
    return _.isEqual(this.path, annotation?.data?.path)
  }
  couldCorrespondingSignExist(): boolean {
    return [
      AnnotationTokenType.HasSign,
      AnnotationTokenType.Number,
      AnnotationTokenType.CompoundGrapheme,
      AnnotationTokenType.PartiallyBroken,
    ].includes(this.type)
  }
}
