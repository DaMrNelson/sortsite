import { Sorter } from ".";
import { next } from "../executor";

/** As seen on TikTok */
export class StalinSort extends Sorter {
  readonly NAME = "StalinSort";

  async run() {
    // Go over list, removing any entries that aren't larger than the intended
    let highestVal = this.data[0];
    let i = 1;
    let purged = 0;

    while (i + purged < this.data.length) {
      if (this.data[i] < highestVal) {
        // Shift all values to the left, removing this value
        for (let j = i; j < this.data.length - 1; j++) {
          this.data[j] = this.data[j + 1];
        }

        // Assign the last value to 0
        this.data[this.data.length - 1] = 0;
        purged += 1;
      } else {
        highestVal = this.data[i];
        i += 1;
      }

      await next(this, "check-ok", undefined, "check-ok", 0, i);
    }

    await next(this, "complete");
  }
}

export default StalinSort;
