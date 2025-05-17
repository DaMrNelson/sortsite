import { create, type StoreApi } from "zustand";
import type { Sorter } from "./sorters";
import BogoSorter from "./sorters/BogoSort";
import StalinSorter from "./sorters/StalinSort";
import MergeSorter from "./sorters/MergeSort";

export const RANDOM_COUNT = 100;
//export const RANDOM_COUNT = 6;
export const RANDOM_MIN = 0;
export const RANDOM_MAX = 100;

export const ERR_STOP_REQUESTED = Symbol("Stop requested");

export type ExecutionState = {
  running: boolean,
  stop: boolean,
  sorters: Record<string, Sorter>,
  data: number[],
  dataSorted: number[],
  actionDisplays: {[sorterId: symbol]: { action: SorterPromiseAction, actionIndex: number }},
  set: StoreApi<ExecutionState>["setState"],
  setData: (data: number[]) => void,
};
/** DO NOT USE! Never updated, even when data is regenerated. */
const _initialData = generateData();
/** Hookable portion of the execution state. Intended to be infrequently updated as the top-level React app hooks to this. */
export const useExecutionState = create<ExecutionState>()((set) => ({
  running: false,
  stop: false,
  sorters: {
    bogo: new BogoSorter(_initialData),
    stalin: new StalinSorter(_initialData),
    merge: new MergeSorter(_initialData),
  },
  data: _initialData,
  dataSorted: [..._initialData].sort((a, b) => a - b),
  actionDisplays: {},
  set: set,
  setData: (data) => {
    set((state) => ({
      data,
      dataSorted: [...data].sort((a, b) => a - b),
      sorters: Object.fromEntries(
        Object.entries(state.sorters).map(
          // TODO: This seems hacky and typescript throws an error,
          //       but I really don't love the idea of hooking around sorter.data.
          //       Q: Other solutions?
          ([k, v]) => [k, new v.constructor(data)],
        )
      ),
    }))
  }
}));

type SorterPromiseAction = "moved" | "check-ok" | "check-bad" | "complete";

/** State that should NEVER be tied into React hooks. Frequent updates, persistent objects. */
export const unhookedExecutionState = {
  numSorters: 0,
  waitingPromises: [] as SorterPromiseWrapper[],
  incompleteSorters: [] as Sorter[],
  completedSorters: [] as Sorter[],
};

export const startExecution = () => {
  const state = useExecutionState.getState();

  if (state.running) {
    return;
  }

  useExecutionState.setState({ running: true });
  unhookedExecutionState.numSorters = Object.keys(state.sorters).length;
  unhookedExecutionState.incompleteSorters = Array.from(Object.values(state.sorters));

  unhookedExecutionState.incompleteSorters.forEach((sorter) => sorter.run());
};

export const stopExecution = () => {
  if (useExecutionState.getState().stop) {
    return;
  }

  useExecutionState.setState({ stop: true }); // Will stop next execution cycle
};

export function generateData () {
  return [...Array(RANDOM_COUNT)].map(() => Math.floor(Math.random() * (RANDOM_MAX - RANDOM_MIN) + RANDOM_MIN))
};

class SorterPromiseWrapper {
  promise: Promise<undefined>;
  resolve: any; // TODO: Typing
  reject: any;

  sorter: Sorter;
  action: SorterPromiseAction;
  actionIndex?: number;

  constructor(sorter: Sorter, action: SorterPromiseAction, actionIndex?: number) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.sorter = sorter;
    this.action = action;
    this.actionIndex = actionIndex;
  }
}



export const next = async (sorter: Sorter, action: SorterPromiseAction, actionIndex?: number) => {
  let myPromise: SorterPromiseWrapper | null = null;

  // Add to promise wait list or complete
  if (action === "complete") {
    const originalDataSorted = useExecutionState.getState().dataSorted;
    const isCorrect = sorter.data.length === originalDataSorted.length && originalDataSorted.every((v, i) => v === sorter.data[i]);
    console.log("Complete", sorter, "! Correct:", isCorrect);

    unhookedExecutionState.completedSorters.push(sorter);
    unhookedExecutionState.incompleteSorters.splice(unhookedExecutionState.incompleteSorters.indexOf(sorter), 1);

    if (unhookedExecutionState.incompleteSorters.length === 0) {
      // TODO: Update state for all complete
      console.log("All completed!");
      useExecutionState.setState({ running: false, stop: false });
      return;
    }
  } else {
    myPromise = new SorterPromiseWrapper(sorter, action, actionIndex)
    unhookedExecutionState.waitingPromises.push(myPromise);
  }

  // Schedule completion of this step for all promises if this was the last one resolved
  if (unhookedExecutionState.waitingPromises.length === unhookedExecutionState.incompleteSorters.length) {
    // Update displays for the action that was just taken
    useExecutionState.setState({
      actionDisplays: Object.fromEntries(
        unhookedExecutionState.waitingPromises
          .filter((wrapper) => wrapper.actionIndex !== undefined)
          .map((wrapper) => ([
            wrapper.sorter.id,
            {
              action: wrapper.action,
              actionIndex: wrapper.actionIndex,
            }
          ]))
      )
    });

    // Schedule next frame
    setTimeout(() => {
      // Resolve promises, allowing the next action to be taken.
      const doStop = useExecutionState.getState().stop;
      const toResolve = [...unhookedExecutionState.waitingPromises];
      unhookedExecutionState.waitingPromises.length = 0; // Essentially empties it

      toResolve.forEach((promise) => {
        if (doStop) {
          promise.reject(ERR_STOP_REQUESTED); // Throw an error, stopping the sorter
        } else {
          promise.resolve(); // Allow the sorter to continue
        }
      });

      if (doStop) {
        useExecutionState.setState({ running: false, stop: false });
      }
    }, 1000/30);
    //}, 0);
    //}, 1000);
  }

  // Wait for my promise to complete before resolving
  if (myPromise !== null) {
    await myPromise.promise;
  }
};
