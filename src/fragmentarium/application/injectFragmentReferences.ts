import { produce, castDraft } from 'immer'
import { Fragment } from 'fragmentarium/domain/fragment'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'

export default function injectFragmentReferences(
  referenceInjector: ReferenceInjector,
  fragment: Fragment,
): Promise<Fragment> {
  return referenceInjector
    .injectReferencesToText(fragment.text)
    .then((text) =>
      produce(fragment, (draft) => {
        draft.text = castDraft(text)
      }),
    )
    .then((fragment) =>
      Promise.all([
        referenceInjector.injectReferencesToIntroduction(fragment.introduction),
        referenceInjector.injectReferencesToNotes(fragment.notes),
      ]).then(([introduction, notes]) =>
        produce(fragment, (draft) => {
          draft.introduction = castDraft(introduction)
          draft.notes = castDraft(notes)
        }),
      ),
    )
}
