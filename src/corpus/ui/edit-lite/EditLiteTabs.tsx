import React, { useCallback, useId, useState } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import { BibliographySearch } from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import { Text } from 'corpus/domain/text'
import EditLiteContext, {
  EditLiteContextValue,
  ImportedLines,
} from 'corpus/ui/edit-lite/EditLiteContext'
import EditLiteImport from 'corpus/ui/edit-lite/EditLiteImport'
import EditLiteManuscriptsTab from 'corpus/ui/edit-lite/EditLiteManuscriptsTab'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import SplitLines from 'corpus/ui/edit-lite/SplitLines'
import useLineImport from 'corpus/ui/edit-lite/useLineImport'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ChapterId } from 'transliteration/domain/chapter-id'

interface Props {
  readonly id: ChapterId
  readonly text: Text
  readonly state: EditLiteState
  readonly context: EditLiteContextValue
  readonly initialLine: number | undefined
  readonly textService: TextService
  readonly fragmentService: FragmentService
  readonly bibliographyService: BibliographySearch
}

const linesTab = 'lines'

export default function EditLiteTabs({
  id,
  text,
  state,
  context,
  initialLine,
  textService,
  fragmentService,
  bibliographyService,
}: Props): JSX.Element {
  const tabsId = useId()
  const [activeTab, setActiveTab] = useState<string>(linesTab)
  const [importedLine, setImportedLine] = useState<number | null>(null)
  const showImportedLines = useCallback((importedLines: ImportedLines) => {
    if (importedLines.count > 0) {
      setImportedLine(importedLines.firstIndex)
    }
    setActiveTab(linesTab)
  }, [])
  const lineImport = useLineImport(context.actions, showImportedLines)

  return (
    <EditLiteContext.Provider value={context}>
      <Tabs
        activeKey={activeTab}
        onSelect={(tab: string | null): void => setActiveTab(tab as string)}
        id={tabsId}
        mountOnEnter
        transition={false}
      >
        <Tab eventKey={linesTab} title="Lines">
          <SplitLines
            key={importedLine ?? 'loaded'}
            state={state}
            initialLine={importedLine ?? initialLine}
          />
        </Tab>
        <Tab eventKey="manuscripts" title="Manuscripts">
          <EditLiteManuscriptsTab
            id={id}
            text={text}
            savedUncertainFragments={
              state.manuscriptsVersion > 0
                ? state.outline.uncertainFragments
                : null
            }
            version={state.manuscriptsVersion}
            textService={textService}
            fragmentService={fragmentService}
            bibliographyService={bibliographyService}
          />
        </Tab>
        {context.canWrite && (
          <Tab eventKey="import" title="Import" unmountOnExit>
            <EditLiteImport lineImport={lineImport} />
          </Tab>
        )}
      </Tabs>
    </EditLiteContext.Provider>
  )
}
