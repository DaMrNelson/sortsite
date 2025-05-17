import { Sorter } from ".";
import { next } from "../executor";

/** As seen on TikTok */
export class MergeSorter extends Sorter {
  async run() {
    await this.mergeSort(0, this.data.length);
    await next(this, "complete");
  }

  async mergeSort(start: number, end: number) {
    if (end <= start) {
      return [];
    } else if (end - start === 1) {
        return [this.data[start]];
    }

    const mid = Math.floor((end - start) / 2 + start);

    if (mid - start > 1) {
      await this.mergeSort(start, mid);
    }

    if (end - mid > 1) {
      await this.mergeSort(mid, end);
    }

    await this.merge(start, mid, end);
  }

  async merge(start: number, mid: number, end: number) {
    const left = this.data.slice(start, mid); // TODO: no cloning. This is just a helpful alias for development
    const right = this.data.slice(mid, end);
    let i = start;
    let il = 0;
    let ir = 0;

    while (i < end) {
      if (il < left.length && ir < right.length) { // Both have data
        if (left[il] < right[ir]) {
          this.data[i] = left[il];
          il += 1;
        } else {
          this.data[i] = right[ir];
          ir += 1;
        }
      } else if (il < left.length) { // Only left has data
        this.data[i] = left[il];
        il += 1;
      } else if (ir < right.length) { // Only right has data
        this.data[i] = right[ir];
        ir += 1;
      } else { // None have data. We are done!
        break;
      }

      await next(this, "check-ok", i);
      i += 1;
    }
  }
}

export default MergeSorter;
