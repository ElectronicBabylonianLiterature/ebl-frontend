import { stringify } from 'common/utils/queryString'
import { toManuscriptsDto } from 'corpus/application/chapterDtoSerialization'
import { createChapterUrl } from 'corpus/application/chapterUrls'
import {
  ChapterChange,
  ChapterEndpoint,
  ChapterRequest,
  ChapterRequestBody,
} from 'corpus/application/edit-lite/ChapterEditSource'
import {
  toDeletedLineDto,
  toLineEditsDto,
  toNewLineDto,
} from 'corpus/application/edit-lite/lineEdits'
import { ChapterId } from 'transliteration/domain/chapter-id'

export type ChapterUrlParameters = Readonly<
  Record<string, string | number | undefined>
>

export interface ChapterUpdate {
  readonly endpoint: ChapterEndpoint
  readonly body: ChapterRequestBody
}

type UpdateFactory<Change> = (change: Change) => ChapterUpdate

type UpdateFactories = {
  readonly [Type in ChapterChange['type']]: UpdateFactory<
    Extract<ChapterChange, { readonly type: Type }>
  >
}

const updateFactories: UpdateFactories = {
  saveLine: (change) => ({
    endpoint: 'lines',
    body: toLineEditsDto(change.index, change.line),
  }),
  addLine: (change) => ({ endpoint: 'lines', body: toNewLineDto(change.line) }),
  deleteLine: (change) => ({
    endpoint: 'lines',
    body: toDeletedLineDto(change.index),
  }),
  importLines: (change) => ({ endpoint: 'import', body: { atf: change.atf } }),
  saveManuscripts: (change) => ({
    endpoint: 'manuscripts',
    body: toManuscriptsDto(change.manuscripts, change.uncertainFragments),
  }),
}

export function createChapterEndpointUrl(
  id: ChapterId,
  endpoint: ChapterEndpoint,
  parameters: ChapterUrlParameters,
): string {
  const query = stringify(parameters, { sort: false, skipEmptyString: true })
  return `${createChapterUrl(id)}/${endpoint}?${query}`
}

export function createChapterUpdateUrl(
  id: ChapterId,
  endpoint: ChapterEndpoint,
  revision?: string,
): string {
  return createChapterEndpointUrl(id, endpoint, { view: 'outline', revision })
}

export function toChapterUpdate(change: ChapterChange): ChapterUpdate {
  const createUpdate = updateFactories[
    change.type
  ] as UpdateFactory<ChapterChange>
  return createUpdate(change)
}

export function describeChapterChange(
  id: ChapterId,
  change: ChapterChange,
  revision?: string,
): ChapterRequest {
  const { endpoint, body } = toChapterUpdate(change)
  return {
    method: 'POST',
    url: createChapterUpdateUrl(id, endpoint, revision),
    body,
  }
}
