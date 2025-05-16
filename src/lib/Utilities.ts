export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type HasBeenAugmented<T> = [keyof T] extends [never] ? false : true;