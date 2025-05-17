import { Sorter } from ".";
import { next } from "../executor";

export class BogoSorter extends Sorter {
  async run() {
    while (true) {
      // Check if the entire list is in order
      let lastVal = this.data[0];
      let allOk = true;

      for (let i = 1; i < this.data.length; i++) {
        const val = this.data[i];

        if (val >= lastVal) {
          lastVal = val;
          await next(this, "check-ok", i);
        } else {
          allOk = false;

          if (this.record === undefined || i - 1 > this.record) {
            this.record = i - 1; // TODO: Publish in next()?
          }

          await next(this, "check-bad", i);
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
        const replaced = this.data[replacedIndex];
        this.data[replacedIndex] = this.data[i];
        this.data[i] = replaced;
      }
    }
  }
}

export default BogoSorter;
