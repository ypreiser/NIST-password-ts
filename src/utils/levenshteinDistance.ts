export default function levenshteinDistance(a: string, b: string): number {
  // Normalize and split into array of grapheme clusters.
  const normalizeAndSplit = (str: string): string[] => [...str.normalize('NFC')];

  let aArray = normalizeAndSplit(a);
  let bArray = normalizeAndSplit(b);

  // Early returns if one of the strings is empty.
  if (aArray.length === 0) return bArray.length;
  if (bArray.length === 0) return aArray.length;

  // To optimize memory, ensure that bArray is the shorter array.
  if (aArray.length < bArray.length) {
    [aArray, bArray] = [bArray, aArray];
  }

  const previousRow: number[] = Array.from({ length: bArray.length + 1 }, (_, j) => j);
  const currentRow: number[] = new Array(bArray.length + 1);

  // Iterate through each character in aArray.
  for (let i = 1; i <= aArray.length; i++) {
    currentRow[0] = i;
    for (let j = 1; j <= bArray.length; j++) {
      const substitutionCost = aArray[i - 1] === bArray[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(
        previousRow[j] + 1,              // deletion
        currentRow[j - 1] + 1,             // insertion
        previousRow[j - 1] + substitutionCost // substitution
      );
    }
    // Copy currentRow into previousRow for next iteration.
    for (let j = 0; j <= bArray.length; j++) {
      previousRow[j] = currentRow[j];
    }
  }

  return previousRow[bArray.length];
}
