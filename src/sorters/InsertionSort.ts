import { Sorter } from ".";
import { next } from "../executor";

export class InsertionSort extends Sorter {
  async run() {
    for (let i = 1; i < this.data.length; i++) {
      let j = i;
      while (this.isOk(j)) {
        [this.data[j], this.data[j - 1]] = [this.data[j - 1], this.data[j]];
        j--;
        await next(this, "moved", i, this.isOk(j) ? "check-bad" : "check-ok", j, j + 1);
      }
      /*for (let j = i; j > 0 && this.data[j - 1] > this.data[j]; j--) {
        [this.data[j], this.data[j + 1]] = [this.data[j + 1], this.data[j]];
        await next(this, "moved", j);
      }*/
    }

    await next(this, "complete");
  }

  isOk(j: number): boolean {
    return j > 0 && this.data[j - 1] > this.data[j]
  }
}

export default InsertionSort;
