import { Sorter } from "./base";
import { next } from "../executor";

export class InsertionSort extends Sorter {
  static readonly NAME = "InsertionSort";

  async run() {
    for (let i = 1; i < this.data.length; i++) {
      let j = i;
      while (this.isOk(j)) {
        [this.data[j], this.data[j - 1]] = [this.data[j - 1], this.data[j]];
        j--;
        await next({ sorter: this, action: "moved", actionIndex: i, groupAction: this.isOk(j) ? "check-bad" : "check-ok", groupActionStart: j, groupActionEnd: j + 1 });
      }
    }

    await next({ sorter: this, action: "complete" });
  }

  isOk(j: number): boolean {
    return j > 0 && this.data[j - 1] > this.data[j]
  }
}

export default InsertionSort;
