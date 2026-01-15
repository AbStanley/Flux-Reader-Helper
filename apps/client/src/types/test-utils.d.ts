/**
 * Utility types for testing
 */

import { Mock } from 'vitest';

/**
 * Type for event handlers in tests
 */
export type EventHandler = (event: Event) => void;

/**
 * Type for mock functions that can be spied on
 */
export type MockFunction<T = unknown> = Mock<T[], T>;

/**
 * Generic mock object type
 */
export type MockObject<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? Mock<A, R>
    : T[K];
};

/**
 * Type for component props in tests
 */
export interface TestComponentProps {
    [key: string]: unknown;
}
