import type {
  SubstrateClient,
  TxBestChainBlockIncluded,
  TxBroadcasted,
  TxDropped,
  TxFinalized,
  TxInvalid,
  TxValidated,
} from "@polkadot-api/substrate-client"
import { Observable } from "rxjs"

const terminalTxEvents = new Set(["error", "finalized", "invalid", "dropped"])

type ObservableClientTxEvent =
  | TxValidated
  | TxBroadcasted
  | TxBestChainBlockIncluded
  | TxFinalized
  | TxInvalid
  | TxDropped

export default (baseTransaction: SubstrateClient["transaction"]) =>
  (transaction: string) =>
    new Observable<ObservableClientTxEvent>((observer) =>
      baseTransaction(
        transaction,
        (event) => {
          if (event.type === "error")
            return observer.error(new Error(event.error))

          observer.next(event)
          if (terminalTxEvents.has(event.type)) observer.complete()
        },
        (error) => {
          observer.error(error)
        },
      ),
    )
