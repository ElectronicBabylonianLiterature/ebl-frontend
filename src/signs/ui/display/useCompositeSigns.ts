import SignService from 'signs/application/SignService'
import Sign from 'signs/domain/Sign'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import useRequestState, { RequestState } from 'common/hooks/useRequestState'

export type CompositeSignsState = RequestState<readonly Sign[]>

export default function useCompositeSigns(
  sign: Sign,
  signService: SignService,
): CompositeSignsState {
  return useRequestState(sign.name, (signal) =>
    signService
      .search(
        {
          isComposite: true,
          value: replaceTransliteration(sign.name.toLowerCase()),
          subIndex: 1,
        },
        signal,
      )
      .then((composites) =>
        composites.filter((composite) => composite.name !== sign.name),
      ),
  )
}
