/**
 *  AskDataResult.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AskDataResult from './AskDataResult';
import { AskDataAnswer } from '../types/interfaces';

const answer = (overrides: Partial<AskDataAnswer>): AskDataAnswer => ({
  sql: 'SELECT TOP (500) 1',
  display: 'table',
  title: 'Result',
  explanation: 'A count of checkouts.',
  columns: ['Checkouts'],
  rows: [[42]],
  truncated: false,
  totalTokens: 120,
  ...overrides,
});

describe('AskDataResult', () => {
  test('a single cell renders as a headline number', () => {
    render(<AskDataResult answer={answer({ display: 'number' })} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('A count of checkouts.')).toBeInTheDocument();
  });

  test('a bar answer renders one row per label', () => {
    render(
      <AskDataResult
        answer={answer({
          display: 'bar',
          columns: ['Building', 'Checkouts'],
          rows: [
            ['Pacific Studios', 12],
            ['Simons Senior', 5],
          ],
        })}
      />,
    );

    expect(screen.getByText('Pacific Studios')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  test('a number answer with several rows falls back to a table', () => {
    render(
      <AskDataResult
        answer={answer({
          display: 'number',
          columns: ['Item'],
          rows: [['Towel'], ['Pillow']],
        })}
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Pillow')).toBeInTheDocument();
  });

  test('a bar answer with a non-numeric value falls back to a table', () => {
    render(
      <AskDataResult
        answer={answer({
          display: 'bar',
          columns: ['Item', 'Last checked out'],
          rows: [['Towel', '2026-03-10']],
        })}
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('no rows shows an empty message', () => {
    render(<AskDataResult answer={answer({ rows: [] })} />);

    expect(screen.getByText('No rows matched')).toBeInTheDocument();
  });

  test('a truncated result says how many rows are shown', () => {
    render(
      <AskDataResult
        answer={answer({ columns: ['Item'], rows: [['Towel']], truncated: true })}
      />,
    );

    expect(screen.getByText('First 1 rows')).toBeInTheDocument();
  });
});
