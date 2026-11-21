import _ from 'lodash'
import {
  toLineAlignmentDto,
  toLineLemmatizationDto,
} from 'corpus/application/chapterDtoSerialization'
import { fromLineDto } from 'corpus/application/dtos'
import { createLineAlignment, Line } from 'corpus/domain/line'
import { createAligner } from 'corpus/ui/edit-lite/EditLiteFakeAnnotations.testSupport'
import EditLiteFakeApi, {
  createChapterRequests,
} from 'corpus/ui/edit-lite/EditLiteFakeApi.testSupport'
import EditLiteFakeChapter from 'corpus/ui/edit-lite/EditLiteFakeChapter.testSupport'
import {
  buildEditLiteOutline,
  editLiteChapterId,
} from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import {
  annotateLine,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { ApiError } from 'http/ApiClient'

export type Annotation = 'alignment' | 'lemmatization'
export type AnnotationBody = Record<string, unknown>
export type BodyChange = (body: AnnotationBody) => void

export interface FakeAnnotationRequests {
  readonly chapter: EditLiteFakeChapter
  readonly fakeApi: EditLiteFakeApi
  readonly bodies: Readonly<Record<Annotation, AnnotationBody>>
  get(path: string): Promise<unknown>
  post(path: string, body: unknown): Promise<unknown>
  save(annotation: Annotation, change?: BodyChange): Promise<unknown>
  loadAnnotatedLine(position: number): Promise<Line>
  expectRefusal(
    request: Promise<unknown>,
    status: number,
    message: string,
  ): Promise<void>
}

export function buildAnnotationPath(
  annotation: Annotation,
  position: number,
  revision: string,
): string {
  return `lines/${position}/${annotation}?view=outline&revision=${revision}`
}

export function buildAnnotationBodies(
  line: Line,
): Readonly<Record<Annotation, AnnotationBody>> {
  return {
    alignment: {
      alignment: toLineAlignmentDto(createLineAlignment(annotateLine(line))),
    },
    lemmatization: {
      lemmatization: toLineLemmatizationDto(buildLineLemmatization(line)),
    },
  }
}

export function buildAlignedLine(line: Line): Line {
  return createAligner(buildAnnotationBodies(line).alignment)(line)
}

export function openFakeAnnotationRequests(
  lines: readonly Line[],
): FakeAnnotationRequests {
  const chapter = new EditLiteFakeChapter(buildEditLiteOutline(lines), lines)
  const fakeApi = new EditLiteFakeApi().serveChapter(chapter)
  const { get, post } = createChapterRequests(editLiteChapterId, () => fakeApi)
  const bodies = buildAnnotationBodies(lines[0])

  return {
    chapter,
    fakeApi,
    bodies,
    get,
    post,
    save: (annotation, change = _.noop): Promise<unknown> => {
      const body = _.cloneDeep(bodies[annotation])
      change(body)
      return post(buildAnnotationPath(annotation, 0, chapter.revision), body)
    },
    loadAnnotatedLine: async (position): Promise<Line> => {
      const page = (await get(
        `lines?offset=${position}&limit=1&revision=${chapter.revision}&tokens=true`,
      )) as { readonly lines: readonly unknown[] }
      return fromLineDto(page.lines[0])
    },
    expectRefusal: async (request, status, message): Promise<void> => {
      const error = await request.catch((reason: unknown) => reason)

      expect(error).toBeInstanceOf(ApiError)
      expect(error).toMatchObject({ status, message })
      expect(chapter.lines).toBe(lines)
      expect(chapter.revision).toBe('revision-1')
    },
  }
}
