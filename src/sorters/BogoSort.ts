import { Sorter } from ".";
import { next } from "../executor";

export class BogoSort extends Sorter {
  async run() {
    while (true) {
      // Check if the entire list is in order
      let lastVal = this.data[0];
      let allOk = true;

      for (let i = 1; i < this.data.length; i++) {
        const val = this.data[i];

        if (val >= lastVal) {
          lastVal = val;
          await next(this, "check-ok", undefined, "check-ok", 0, i);
        } else {
          allOk = false;

          if (this.record === undefined || i - 1 > this.record) {
            this.record = i - 1; // TODO: Publish in next()?
          }

          await next(this, "check-bad", i, "check-ok", 0, i - 1);
          break;
        }
      }

      // If all OK, done!
      if (allOk) {
        await next(this, "complete");
        return;
      }

      // Randomize the list
      for (let i = 0; i < this.data.length; i++) {
        const replacedIndex = Math.floor(Math.random() * this.data.length);
        [this.data[i], this.data[replacedIndex]] = [this.data[replacedIndex], this.data[i]];
      }
    }
  }
}

export default BogoSort;
