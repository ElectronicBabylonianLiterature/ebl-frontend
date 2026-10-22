import type { FragmentRepository } from 'fragmentarium/application/fragmentServicePorts'
import { ApiError } from 'http/ApiClient'

export default async function findFragmentExistence(
  repository: Pick<FragmentRepository, 'find'>,
  number: string,
): Promise<boolean> {
  try {
    await repository.find(number)
    return true
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return false
    }
    throw error
  }
}
