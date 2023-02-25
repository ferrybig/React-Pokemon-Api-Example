import {
  createContext,
  useSyncExternalStore,
  useState,
  useContext,
  useEffect
} from "react";

const GARBAGE_COLLECTION_TIMEOUT = 5 * 60 * 1000;
const GABRAGE_INTERVAL = 60 * 1000;

class Result {
  #subscribers = [];
  #lastGarbageCheck = Date.now();
  lastFetch = Date.now();
  #state;

  constructor(promiseProvider) {
    this.#state = this.#refetch(promiseProvider);
  }
  refetch(promiseProvider) {
    this.#state = this.#refetch(promiseProvider);
    this.#lastGarbageCheck = Date.now();
    this.lastFetch = Date.now();
  }
  #refetch = (promiseProvider) => {
    const requestId = Math.random();
    const promise = Promise.resolve().then(promiseProvider);
    const state = {
      requestId,
      type: "loading",
      value: promise
    };
    promise.then(
      (res) => {
        console.log(res);
        if (this.#state.requestId !== requestId) return;
        this.lastFetch = Date.now();
        this.#state = {
          requestId,
          type: "success",
          value: res
        };
        this.#notifyListeners();
      },
      (err) => {
        if (this.#state.requestId !== requestId) return;
        this.lastFetch = Date.now();
        this.#state = {
          requestId,
          type: "error",
          value: err
        };
        this.#notifyListeners();
      }
    );
    return state;
  };
  #notifyListeners = () => {
    for (const subscriber of this.#subscribers) subscriber();
  };
  update = (listener) => {
    this.#subscribers.push(listener);
    return () => {
      // This can be made more performant with indexOf followed by splice
      this.#subscribers = this.#subscribers.filter((e) => e !== listener);
    };
  };
  getState = () => this.#state;

  checkGarbageCollection() {
    if (this.#subscribers.length !== 0) {
      this.#lastGarbageCheck = Date.now();
      return false;
    } else {
      return this.#lastGarbageCheck + GARBAGE_COLLECTION_TIMEOUT < Date.now();
    }
  }
}

class QueryClientState {
  #requestMap = new Map();

  getOrCreate(key, promiseProvider) {
    let request = this.#requestMap.get(key);
    // Make a new request if the request does not exist, or the current one is in error without listeners
    if (
      !request // ||
      //(request.subscribers.length === 0 &&
      // request.state === "error" &&
      // request.lastFetch + 1000 < Date.now())
    ) {
      request = new Result(promiseProvider);
      this.#requestMap.set(key, request);
    }
    return request;
  }

  checkGarbageCollection() {
    for (const [key, value] of this.#requestMap)
      if (value.checkGarbageCollection()) this.#requestMap.delete(key);
  }
}

export const QueryClientContext = createContext(null);

function useQueryInternally(key, promiseProvider) {
  const client = useContext(QueryClientContext);
  if (client === null)
    throw new Error(
      "Make sure to add a QueryClient component before trying to use this hook"
    );
  return client.getOrCreate(key, promiseProvider);
}

export function useQuerySuspense(key, promiseProvider) {
  const result = useQueryInternally(key, promiseProvider);
  const state = useSyncExternalStore(result.update, result.getState);
  if (state.type === "loading") throw state.value;
  if (state.type === "error") throw state.value;
  console.log(result);
  return {
    refetch: () => result.refetch(promiseProvider),
    data: state.value
  };
}
export function useQuerySuspenseSimple(url) {
  return useQuerySuspense(url, async () => await (await fetch(url)).json());
}

export function QueryClient({ children }) {
  const [queryClient] = useState(() => new QueryClientState());
  useEffect(() => {
    const interval = setInterval(() => {
      requestIdleCallback(
        () => {
          queryClient.checkGarbageCollection();
        },
        { timeout: GABRAGE_INTERVAL }
      );
    }, GABRAGE_INTERVAL);
    return () => clearInterval(interval);
  });
  return (
    <QueryClientContext.Provider value={queryClient}>
      {children}
    </QueryClientContext.Provider>
  );
}
