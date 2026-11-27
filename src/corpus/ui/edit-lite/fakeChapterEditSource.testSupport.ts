import {
  ChapterEditSource,
  WordInstances,
} from 'corpus/application/edit-lite/ChapterEditSource'
import {
  ChapterOutline,
  ManuscriptSummary,
} from 'corpus/application/edit-lite/chapterOutline'
import { toChapterUpdate } from 'corpus/application/edit-lite/chapterRequests'
import {
  createLineLemmatization,
  LemmaSuggestionsDto,
  LineLemmaSource,
} from 'corpus/application/edit-lite/lineLemmatization'
import { LineAlignment } from 'corpus/domain/alignment'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import Word from 'dictionary/domain/Word'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  editLiteManuscripts,
  editLiteRevision,
} from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import {
  createAligner,
  createLemmatizer,
} from 'corpus/ui/edit-lite/EditLiteFakeAnnotations.testSupport'
import EditLiteFakeDictionary, {
  buildWordsPath,
  FakeLemmaSuggestion,
  lemmaBatchPath,
  properNounPath,
} from 'corpus/ui/edit-lite/EditLiteFakeDictionary.testSupport'
import {
  countFakeInstances,
  lemmatizeFakeInstances,
} from 'corpus/ui/edit-lite/EditLiteFakeInstances.testSupport'
import {
  importFakeLines,
  toManuscriptSummary,
  toSavedLine,
} from 'corpus/ui/edit-lite/fakeChapterLines.testSupport'
import { annotateLine } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { moveItem } from 'corpus/ui/edit-lite/lineMove'

export {
  importFakeLines,
  toSavedLine,
} from 'corpus/ui/edit-lite/fakeChapterLines.testSupport'

export type FakeChapterEditSource = jest.Mocked<ChapterEditSource>

export interface FakeChapterEditSourceOptions {
  readonly lines?: readonly Line[]
  readonly words?: readonly Word[]
  readonly suggestions?: readonly FakeLemmaSuggestion[]
}

interface FakeChapter {
  lines: readonly Line[]
  manuscripts: readonly ManuscriptSummary[]
  uncertainFragments: readonly string[]
}

export function createFakeChapterEditSource(
  options: FakeChapterEditSourceOptions = {},
): FakeChapterEditSource {
  const chapter: FakeChapter = {
    lines: options.lines ?? buildEditLiteLines(),
    manuscripts: editLiteManuscripts,
    uncertainFragments: [],
  }
  const buildOutline = (): ChapterOutline => ({
    ...buildEditLiteOutline(chapter.lines),
    manuscripts: chapter.manuscripts,
    uncertainFragments: chapter.uncertainFragments,
  })
  const save = (change: Partial<FakeChapter>): Promise<ChapterOutline> => {
    Object.assign(chapter, change)
    return Promise.resolve(buildOutline())
  }
  const annotate = (
    index: number,
    annotator: (line: Line) => Line,
  ): Promise<ChapterOutline> =>
    save({
      lines: chapter.lines.map((line, lineIndex) =>
        lineIndex === index ? annotator(line) : line,
      ),
    })
  const dictionary = new EditLiteFakeDictionary(
    options.words ?? [],
    options.suggestions,
  )
  const lemmaSource: LineLemmaSource = {
    findSuggestions: (words) =>
      dictionary.respond('POST', lemmaBatchPath, { words }) as Promise<
        LemmaSuggestionsDto[]
      >,
    findWords: (ids) =>
      dictionary.respond('GET', buildWordsPath(ids), null) as Promise<Word[]>,
  }

  return {
    loadOutline: jest.fn(
      (): Promise<ChapterOutline> => Promise.resolve(buildOutline()),
    ),
    loadLines: jest.fn(
      (offset: number, limit: number): Promise<readonly Line[]> =>
        Promise.resolve(chapter.lines.slice(offset, offset + limit)),
    ),
    loadAnnotatedLine: jest.fn(
      (index: number): Promise<Line> =>
        Promise.resolve(annotateLine(chapter.lines[index])),
    ),
    loadLemmatization: jest.fn(
      (line: Line): Promise<readonly LineLemmatization[]> =>
        createLineLemmatization(line, lemmaSource),
    ),
    searchLemma: jest.fn(
      (query: string): Promise<readonly Word[]> =>
        dictionary.respond('GET', `/words?lemma=${query}`, null) as Promise<
          Word[]
        >,
    ),
    saveLine: jest.fn((index: number, _original: Line, draft: Line) =>
      save({
        lines: chapter.lines.map((line, lineIndex) =>
          lineIndex === index ? toSavedLine(draft) : line,
        ),
      }),
    ),
    addLine: jest.fn((line: Line) =>
      save({ lines: [...chapter.lines, toSavedLine(line)] }),
    ),
    deleteLine: jest.fn((index: number) =>
      save({
        lines: chapter.lines.filter((_line, lineIndex) => lineIndex !== index),
      }),
    ),
    moveLine: jest.fn((from: number, to: number) =>
      save({ lines: moveItem(chapter.lines, from, to) }),
    ),
    importLines: jest.fn((atf: string) =>
      save({ lines: importFakeLines(chapter.lines, atf) }),
    ),
    createProperNoun: jest.fn(
      (lemma: string, namedEntityTag: string): Promise<Word> =>
        dictionary.respond('POST', properNounPath, {
          lemma,
          namedEntityTags: [namedEntityTag],
        }) as Promise<Word>,
    ),
    countWordInstances: jest.fn(
      (word: string): Promise<WordInstances> =>
        new Promise((resolve) =>
          resolve(countFakeInstances(chapter.lines, word, editLiteRevision)),
        ),
    ),
    saveAlignment: jest.fn((index: number, alignment: LineAlignment) =>
      annotate(
        index,
        createAligner(
          toChapterUpdate({ type: 'saveAlignment', index, alignment }).body,
        ),
      ),
    ),
    saveLemmatization: jest.fn(
      (index: number, lemmatization: readonly LineLemmatization[]) =>
        annotate(
          index,
          createLemmatizer(
            toChapterUpdate({ type: 'saveLemmatization', index, lemmatization })
              .body,
          ),
        ),
    ),
    lemmatizeWordInstances: jest.fn(
      (word: string, lemmaIds: readonly string[]) =>
        new Promise<ChapterOutline>((resolve) =>
          resolve(
            save({
              lines: lemmatizeFakeInstances(
                chapter.lines,
                toChapterUpdate({ type: 'lemmatizeInstances', word, lemmaIds })
                  .body,
              ),
            }),
          ),
        ),
    ),
    saveManuscripts: jest.fn(
      (
        manuscripts: readonly Manuscript[],
        uncertainFragments: readonly string[],
      ) =>
        save({
          manuscripts: manuscripts.map(toManuscriptSummary),
          uncertainFragments,
        }),
    ),
  }
}
