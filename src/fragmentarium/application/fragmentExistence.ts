import type { FragmentRepository } from 'fragmentarium/application/fragmentServicePorts'
import { isNotFoundError } from 'http/ApiClient'

export default async function findFragmentExistence(
  repository: Pick<FragmentRepository, 'find'>,
  number: string,
  signal?: AbortSignal,
): Promise<boolean> {
  try {
    await repository.find(number, undefined, true, signal)
    return true
  } catch (error) {
    if (isNotFoundError(error)) {
      return false
    }
    throw error
  }
}
