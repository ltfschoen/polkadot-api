const MAX_TIME = 2_000

export interface Subscriber<T> {
  next: (data: T) => void
  error: (e: Error) => void
}

export const getSubscriptionsManager = <T>() => {
  const subscriptions = new Map<string, Subscriber<T>>()

  return {
    has: subscriptions.has.bind(subscriptions),
    subscribe(id: string, subscriber: Subscriber<T>) {
      subscriptions.set(id, subscriber)
    },
    unsubscribe(id: string) {
      subscriptions.delete(id)
    },
    next(id: string, data: T) {
      subscriptions.get(id)?.next(data)
    },
    error(id: string, e: Error) {
      const subscriber = subscriptions.get(id)
      if (subscriber) {
        subscriptions.delete(id)
        subscriber.error(e)
      }
    },
    errorAll(e: Error) {
      const subscribers = [...subscriptions.values()]
      subscriptions.clear()
      subscribers.forEach((s) => {
        s.error(e)
      })
    },
  }
}

export type SubscriptionManager<T> = ReturnType<
  typeof getSubscriptionsManager<T>
>

export class OrphanMessages<T> {
  #messages: Map<string, { expiry: number; messages: T[] }>
  #token: number | null

  constructor() {
    this.#messages = new Map()
    this.#token = null
  }

  private checkClear(): void {
    if (this.#messages.size > 0) return

    clearInterval(this.#token as any)
    this.#token = null
  }

  set(key: string, message: T): void {
    const messages = this.#messages.get(key)?.messages ?? []
    messages.push(message)
    this.#messages.set(key, { expiry: Date.now() + MAX_TIME, messages })

    this.#token =
      this.#token ||
      (setInterval(() => {
        const now = Date.now()
        ;[...this.#messages.entries()].forEach(([key, entry]) => {
          if (entry.expiry > now) this.#messages.delete(key)
        })
        this.checkClear()
      }, MAX_TIME) as unknown as number)
  }

  retrieve(key: string): T[] {
    const result = this.#messages.get(key)
    if (!result) return []
    this.#messages.delete(key)
    this.checkClear()
    return result.messages
  }

  clear() {
    this.#messages.clear()
    this.checkClear()
  }
}
