import { ERR_STOP_REQUESTED } from "../executor";

// TODO: The amount I have to work at this is insane. Surely I am doing something wrong, no?
type _SorterConstructor = new (data: number[]) => Sorter;
export type SorterConstructor = {
  getName: () => string;
} & _SorterConstructor;

export abstract class Sorter {
  static readonly NAME: string;
  readonly DESCRIPTION?: string;

  id: symbol;
  data: number[];
  /** Highest index reached OK. Each sorter is responsible for setting this. This property is not hooked but is used. // TODO: Probably don't do that lol */
  record?: number;
  isRunning: boolean = false;
  isComplete: boolean = false;

  constructor(data: number[]) {
    //this.id = Symbol(this.constructor.name);
    //this.id = Symbol(this.constructor.NAME);
    this.id = Symbol(); // TODO: MAKE UNIQUE AND DESCRIPTIVE
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

  static getName() {
    return this.NAME;
  }

  getName() {
    return (this.constructor as unknown as typeof Sorter).NAME;
  }
}
