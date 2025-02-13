export default function levenshteinDistance(a: string, b: string): number {
  const normalizeAndSplit = (str: string): string[] => [...str.normalize('NFC')];

  const aArray = normalizeAndSplit(a);
  const bArray = normalizeAndSplit(b);
  const matrix: number[][] = Array.from({ length: aArray.length + 1 }, (_, i) =>
    Array.from({ length: bArray.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= aArray.length; i++) {
    for (let j = 1; j <= bArray.length; j++) {
      matrix[i][j] = aArray[i - 1] === bArray[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]) + 1;
    }
  }
  return matrix[aArray.length][bArray.length];
}
