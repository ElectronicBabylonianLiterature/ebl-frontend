import produce, { Draft, immerable } from 'immer'
import { AcquisitionDto } from './FragmentDtos'

export class Acquisition {
  [immerable] = true
  readonly supplier: string
  readonly date?: number
  readonly description?: string

  constructor(supplier: string, date?: number, description?: string) {
    this.supplier = supplier
    this.date = date
    this.description = description
  }

  static fromDto(dto: AcquisitionDto): Acquisition {
    return new Acquisition(dto.supplier, dto.date, dto.description)
  }

  toDto(): AcquisitionDto {
    return {
      supplier: this.supplier,
      date: this.date,
      description: this.description,
    }
  }

  setSupplier(supplier: string): Acquisition {
    return produce(this, (draft: Draft<Acquisition>) => {
      draft.supplier = supplier
    })
  }

  setDate(date: number | undefined): Acquisition {
    return produce(this, (draft: Draft<Acquisition>) => {
      draft.date = date
    })
  }

  setDescription(description: string | undefined): Acquisition {
    return produce(this, (draft: Draft<Acquisition>) => {
      draft.description = description
    })
  }

  toString(): string {
    const mainParts = [this.supplier]
    if (this.date) {
      mainParts.push(String(this.date))
    }
    let result = mainParts.join(', ')
    if (this.description) {
      result += ` (${this.description})`
    }
    return result
  }
}
