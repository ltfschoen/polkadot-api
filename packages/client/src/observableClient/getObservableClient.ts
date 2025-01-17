import type { SubstrateClient } from "@polkadot-api/substrate-client"
export type * from "./chainHead"

import { getChainHead$ } from "./chainHead"
import getTx$ from "./tx"

export const getObservableClient = ({
  chainHead,
  transaction,
  destroy,
}: SubstrateClient) => ({
  chainHead$: () => getChainHead$(chainHead),
  tx$: getTx$(transaction),
  destroy,
})
