import { Sorter } from ".";
import { next } from "../executor";

/** WOW this one sucks */
export class BubbleSort extends Sorter {
  async run() {
    while (true) {
      let swaps = 0;

      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i] > this.data[i + 1]) {
          const other = this.data[i];
          this.data[i] = this.data[i + 1];
          this.data[i + 1] = other;
          swaps += 1;
          await next(this, "check-bad", i + 1);
        } else {
          await next(this, "check-ok", i);
        }
      }

      if (swaps === 0) {
        break;
      }
    }

    await next(this, "complete");
  }
}

export default BubbleSort;
