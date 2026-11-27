import SignService from 'signs/application/SignService'
import Sign, { MesZlKap2Entry } from 'signs/domain/Sign'
import useRequestState, { RequestState } from 'common/hooks/useRequestState'

export type MesZlKap2State = RequestState<readonly MesZlKap2Entry[]>

export default function useMesZlKap2(
  sign: Sign,
  signService: SignService,
  allowed: boolean,
): MesZlKap2State {
  const requested = allowed && sign.mesZlNumbers.length > 0
  return useRequestState(requested ? sign.name : null, (signal) =>
    signService.findMesZlKap2(sign.name, signal),
  )
}
