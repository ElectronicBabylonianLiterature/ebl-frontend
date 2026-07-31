import Bluebird from 'bluebird'
import { castDraft, produce } from 'immer'
import { Fragment } from 'fragmentarium/domain/fragment'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'

export function injectReferences(
  referenceInjector: ReferenceInjector,
  fragment: Fragment,
): Bluebird<Fragment> {
  return referenceInjector
    .injectReferencesToText(fragment.text)
    .then((text) =>
      produce(fragment, (draft) => {
        draft.text = castDraft(text)
      }),
    )
    .then((withText) =>
      Bluebird.all([
        referenceInjector.injectReferencesToIntroduction(withText.introduction),
        referenceInjector.injectReferencesToNotes(withText.notes),
      ]).then(([introduction, notes]) =>
        produce(withText, (draft) => {
          draft.introduction = castDraft(introduction)
          draft.notes = castDraft(notes)
        }),
      ),
    )
}
