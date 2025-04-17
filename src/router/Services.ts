import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import MarkupService, {
  CachedMarkupService,
} from 'markup/application/MarkupService'
import SignService from 'signs/application/SignService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'

import { FindspotService } from 'fragmentarium/application/FindspotService'
import './router.sass'
import DossiersService from 'dossiers/application/DossiersService'

export default interface Services {
  wordService: WordService
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  bibliographyService: BibliographyService
  textService: TextService
  signService: SignService
  markupService: MarkupService
  cachedMarkupService: CachedMarkupService
  afoRegisterService: AfoRegisterService
  dossiersService: DossiersService
  findspotService: FindspotService
}
