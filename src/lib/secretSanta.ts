export type Person = { id: string; name: string };
export type Rule = [string, string]; // these two must not draw each other

/**
 * Assigns each giver a receiver: nobody gets themselves, rules are respected.
 * Randomised backtracking; returns null when no valid draw exists.
 */
export function drawNames(people: Person[], rules: Rule[]): Record<string, string> | null {
  if (people.length < 3) return null;
  const blocked = new Set(rules.flatMap(([a, b]) => [`${a}>${b}`, `${b}>${a}`]));
  const ids = people.map((p) => p.id);

  // One complete search in random order; the step budget keeps huge
  // impossible rule sets from freezing the UI.
  let steps = 0;
  {
    const givers = shuffle(ids);
    const result: Record<string, string> = {};
    const used = new Set<string>();

    const solve = (i: number): boolean => {
      if (i === givers.length) return true;
      if (++steps > 200_000) return false;
      const giver = givers[i];
      for (const receiver of shuffle(ids)) {
        if (receiver === giver || used.has(receiver) || blocked.has(`${giver}>${receiver}`)) continue;
        result[giver] = receiver;
        used.add(receiver);
        if (solve(i + 1)) return true;
        used.delete(receiver);
      }
      return false;
    };

    if (solve(0)) return result;
  }
  return null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
