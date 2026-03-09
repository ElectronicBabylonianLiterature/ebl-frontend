import { AbstractLine, DollarAndAtLineDto, Ruling } from './abstract-line'

function addParenthesisToDisplayValue(
  data: DollarAndAtLineDto,
): DollarAndAtLineDto {
  return { ...data, displayValue: `(${data.displayValue})` }
}

export abstract class DollarLine extends AbstractLine {
  readonly displayValue: string

  constructor(data: DollarAndAtLineDto) {
    super('$', data.content)
    this.displayValue = data.displayValue
  }
}

export interface LooseDollarLineDto extends DollarAndAtLineDto {
  readonly type: 'LooseDollarLine'
  readonly text: string
}

export class LooseDollarLine extends DollarLine {
  readonly type = 'LooseDollarLine'
  readonly text: string

  constructor(data: LooseDollarLineDto) {
    super(data)
    this.text = data.text
  }
}

export interface ImageDollarLineDto extends DollarAndAtLineDto {
  readonly type: 'ImageDollarLine'
  readonly number: string
  readonly letter: string | null
  readonly text: string
}

export class ImageDollarLine extends DollarLine {
  readonly type = 'ImageDollarLine'
  readonly number: string
  readonly letter: string | null
  readonly text: string

  constructor(data: ImageDollarLineDto) {
    super(data)
    this.number = data.number
    this.letter = data.letter
    this.text = data.text
  }
}

export interface RulingDollarLineDto extends DollarAndAtLineDto {
  readonly type: 'RulingDollarLine'
  readonly number: Ruling
  readonly status: string | null
}

export class RulingDollarLine extends DollarLine {
  readonly type = 'RulingDollarLine'
  readonly number: Ruling
  readonly status: string | null

  constructor(data: RulingDollarLineDto) {
    super(addParenthesisToDisplayValue(data))
    this.number = data.number
    this.status = data.status
  }
}

export interface SealDollarLineDto extends DollarAndAtLineDto {
  readonly type: 'SealDollarLine'
  readonly number: number
}

export class SealDollarLine extends DollarLine {
  readonly type = 'SealDollarLine'
  readonly number: number

  constructor(data: SealDollarLineDto) {
    super(addParenthesisToDisplayValue(data))
    this.number = data.number
  }
}
interface ScopeContainer {
  readonly type: string
  readonly content: string
  readonly text: string
}
export interface StateDollarLineDto extends DollarAndAtLineDto {
  readonly type: 'StateDollarLine'
  readonly qualification: string | null
  readonly extent: string | null
  readonly scope: ScopeContainer | null
  readonly state: string | null
  readonly status: string | null
}

export class StateDollarLine extends DollarLine {
  readonly type = 'SealDollarLine'
  readonly qualification: string | null
  readonly extent: string | null
  readonly scope: ScopeContainer | null
  readonly state: string | null
  readonly status: string | null

  constructor(data: StateDollarLineDto) {
    super(addParenthesisToDisplayValue(data))
    this.qualification = data.qualification
    this.extent = data.extent
    this.scope = data.scope
    this.state = data.state
    this.status = data.status
  }
}
