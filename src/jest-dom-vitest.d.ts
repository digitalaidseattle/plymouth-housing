// jest-dom's bundled vitest typings augment `Assertion<T>`, which no longer
// merges with vitest 5's `Assertion<R, T>`. Augment `Matchers` instead.
import 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  interface Matchers<R, T> extends TestingLibraryMatchers<any, R> {}
}
