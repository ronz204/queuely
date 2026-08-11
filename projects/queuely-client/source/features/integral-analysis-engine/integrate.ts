export type IntegrableFunction = (t: number) => number;

export type IntegrationMethod = "trapezoidal" | "simpson";

function toEvenSubdivisionCount(n: number): number {
  return n % 2 === 0 ? n : n + 1;
}

export function integrateTrapezoidal(f: IntegrableFunction, a: number, b: number, n: number): number {
  const h = (b - a) / n;
  let sum = (f(a) + f(b)) / 2;

  for (let i = 1; i < n; i++) {
    sum += f(a + i * h);
  }

  return sum * h;
}

export function integrateSimpson(f: IntegrableFunction, a: number, b: number, n: number): number {
  const evenN = toEvenSubdivisionCount(n);
  const h = (b - a) / evenN;
  let sum = f(a) + f(b);

  for (let i = 1; i < evenN; i++) {
    const coefficient = i % 2 === 0 ? 2 : 4;
    sum += coefficient * f(a + i * h);
  }

  return (sum * h) / 3;
}

export function integrate(f: IntegrableFunction, a: number, b: number, n: number, method: IntegrationMethod): number {
  return method === "simpson" ? integrateSimpson(f, a, b, n) : integrateTrapezoidal(f, a, b, n);
}

export function averageValue(
  f: IntegrableFunction,
  a: number,
  b: number,
  n: number,
  method: IntegrationMethod = "simpson",
): number {
  return integrate(f, a, b, n, method) / (b - a);
}
