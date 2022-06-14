import { Token } from './token'
import { immerable } from 'immer'
import { setSentenceIndices } from 'corpus/domain/line-details'

export interface LineBaseDto {
  readonly type: string
  readonly prefix: string
  readonly content: readonly Token[]
}

export interface DollarAndAtLineDto extends LineBaseDto {
  readonly displayValue: string
}

export abstract class AbstractLine {
  readonly [immerable] = true
  abstract get type(): string
  readonly prefix: string
  readonly content: readonly Token[]

  constructor(prefix: string, content: readonly Token[]) {
    this.prefix = prefix
    this.content = setSentenceIndices(content as Token[])
  }
}

export type Ruling = 'SINGLE' | 'DOUBLE' | 'TRIPLE'
