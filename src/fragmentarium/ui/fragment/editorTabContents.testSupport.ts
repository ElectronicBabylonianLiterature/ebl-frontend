import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import WordService from 'dictionary/application/WordService'
import { TabsProps } from 'fragmentarium/ui/fragment/editorTabContents'

type RequiredTabsProps = Pick<
  TabsProps,
  'fragment' | 'fragmentService' | 'onSave'
>

export function createTabsProps(props: RequiredTabsProps): TabsProps {
  return {
    fragmentSearchService: new (FragmentSearchService as jest.Mock<
      jest.Mocked<FragmentSearchService>
    >)(),
    wordService: new (WordService as jest.Mock<jest.Mocked<WordService>>)(),
    findspotService: new (FindspotService as jest.Mock<
      jest.Mocked<FindspotService>
    >)(),
    activeLine: '',
    onToggle: jest.fn(),
    isColumnVisible: true,
    ...props,
  }
}
