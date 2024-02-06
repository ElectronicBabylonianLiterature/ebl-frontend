import Promise from 'bluebird'
import KingsRepository from 'chronology/infrastructure/KingsRepository'
import { King } from 'chronology/ui/BrinkmanKings/BrinkmanKings'

export interface kingsSearch {
  fetchAll(query: string): Promise<readonly King[]>
}

export default class KingsService implements kingsSearch {
  private readonly kingsRepository: KingsRepository
  private _kings: King[] = []
  kingOptions: Array<{ label: string; value: King }> = []

  constructor(kingsRepository: KingsRepository) {
    this.kingsRepository = kingsRepository
  }

  static async createAndInitialize(
    kingsRepository: KingsRepository
  ): Promise<KingsService> {
    const service = new KingsService(kingsRepository)
    await service.initializeKings()
    return service
  }

  get kings(): King[] {
    return this._kings
  }

  private async initializeKings(): Promise<void> {
    try {
      this._kings = await this.fetchAll()
      this.kingOptions = this.getKingOptions()
    } catch (error) {
      console.error('Failed to initialize kingsCollection', error)
    }
  }

  fetchAll(): Promise<King[]> {
    return this.kingsRepository.fetchAll()
  }

  private getKingOptions(): Array<{ label: string; value: King }> {
    return this.kings
      .filter((king) => !['16', '17'].includes(king.dynastyNumber))
      .map((king) => {
        return {
          label: this.getKingSelectLabel(king),
          value: king,
        }
      })
  }

  private getKingSelectLabel(king: King): string {
    const kingYears = king.date ? ` (${king.date})` : ''
    return `${king.name}${kingYears}, ${king.dynastyName}`
  }
}
