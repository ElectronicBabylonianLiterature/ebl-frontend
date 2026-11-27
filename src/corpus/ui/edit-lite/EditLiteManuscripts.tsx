import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { createChapterUrl } from 'corpus/application/chapterUrls'
import TextService from 'corpus/application/TextService'
import { toProvenance } from 'corpus/domain/provenance'
import EditLiteManuscriptsEditor, {
  ManuscriptsData,
} from 'corpus/ui/edit-lite/EditLiteManuscriptsEditor'
import FragmentService from 'fragmentarium/application/FragmentService'
import { sortProvenances } from 'fragmentarium/domain/Provenance'
import withData from 'http/withData'
import { ChapterId } from 'transliteration/domain/chapter-id'

interface Props {
  readonly id: ChapterId
  readonly uncertainFragments: readonly string[]
  readonly version: number
  readonly textService: TextService
  readonly fragmentService: FragmentService
  readonly searchBibliography: (
    query: string,
  ) => Promise<readonly BibliographyEntry[]>
}

type EditorProps = Pick<Props, 'uncertainFragments' | 'searchBibliography'>
type LoaderProps = Omit<Props, keyof EditorProps>

function loadManuscriptsData(
  { id, textService, fragmentService }: Props,
  signal: AbortSignal,
): Promise<ManuscriptsData> {
  return Promise.all([
    textService.findManuscripts(id, signal),
    fragmentService.fetchProvenances(),
  ]).then(([manuscripts, provenanceRecords]) => ({
    manuscripts,
    provenances: sortProvenances(provenanceRecords).map(toProvenance),
  }))
}

export default withData<EditorProps, LoaderProps, ManuscriptsData>(
  EditLiteManuscriptsEditor,
  loadManuscriptsData,
  { watch: (props) => [createChapterUrl(props.id), props.version] },
)
