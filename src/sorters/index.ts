import { ERR_STOP_REQUESTED } from "../executor";

export abstract class Sorter {
  abstract readonly NAME: string;
  readonly DESCRIPTION?: string;

  id: symbol;
  data: number[];
  /** Highest index reached OK. Each sorter is responsible for setting this. This property is not hooked but is used. // TODO: Probably don't do that lol */
  record?: number;
  isRunning: boolean = false;
  isComplete: boolean = false;

  constructor(data: number[]) {
    this.id = Symbol(this.constructor.name);
    this.data = [...data];
  }

  abstract run(): Promise<void>; // TODO: How to enforce that this is async?

  async start() {
    this.isRunning = true;

    try {
      await this.run();
      this.isComplete = true;
    } catch (err) {
      if (err === ERR_STOP_REQUESTED) {
        console.info("Stopped on user requested. Sorter:", this);
      } else {
        console.error("An unexpected error occurred:", err);
        // TODO: Display error to user
      }
    }

    this.isRunning = false;
  }

  setData(data: number[]) {
    if (this.isRunning) {
      console.error("TODO: Run was interrupted and is now untracked! Work around that!");
    }

    this.data = [...data];
  }
}
