export function areSimilar(word1: string, word2: string): boolean {
  // Convertir en minuscules pour éviter la différence de casse
  word1 = word1.toLowerCase();
  word2 = word2.toLowerCase();

  // Vérifier si les mots sont exactement les mêmes
  if (word1 === word2) return true;

  // Vérifier si l'un des mots est le pluriel de l'autre (ajout d'un "s")
  if (word1 + 's' === word2 || word2 + 's' === word1) return true;

  // Vérifier la distance de Levenshtein (permettant 1 changement max)
  if (levenshteinDistance(word1, word2) <= 1) return true;

  return false;
}

function levenshteinDistance(a: string, b: string): number {
  const dp: number[][] = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // Suppression
        dp[i][j - 1] + 1, // Insertion
        dp[i - 1][j - 1] + cost, // Substitution
      );
    }
  }

  return dp[a.length][b.length];
}
