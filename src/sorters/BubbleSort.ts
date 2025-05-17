import { Sorter } from ".";
import { next } from "../executor";

/** WOW this one sucks */
export class BubbleSort extends Sorter {
  readonly NAME = "BubbleSort";

  async run() {
    let moved = 0;

    while (true) {
      let swaps = 0;

      for (let i = 0; i < this.data.length - moved; i++) {
        if (this.data[i] > this.data[i + 1]) {
          [this.data[i], this.data[i + 1]] = [this.data[i + 1], this.data[i]];
          swaps += 1;
          await next(this, "check-bad", i + 1, "check-ok", this.data.length - moved, this.data.length);
        } else {
          await next(this, "check-ok", i, "check-ok", this.data.length - moved, this.data.length);
        }
      }

      if (swaps === 0) {
        break;
      }

      moved += 1;
    }

    await next(this, "complete");
  }
}

export default BubbleSort;
