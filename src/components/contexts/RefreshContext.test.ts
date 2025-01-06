import React from 'react';
import { render, act } from '@testing-library/react';
import { RefreshContextProvider } from './RefreshContextProvider';
import { RefreshContext } from './RefreshContext';

describe('RefreshContextProvider', () => {
  it('provides the refresh context with initial value', () => {
    let contextValue: any;
    const TestComponent: React.FC = () => {
      contextValue = React.useContext(RefreshContext);
      return null;
    };

    render(
      React.createElement(RefreshContextProvider, null,
        React.createElement(TestComponent)
      )
    );

    expect(typeof contextValue.refresh).toBe('number');
  });

  it('allows setting refresh value manually', () => {
    let contextValue: any;
    const TestComponent: React.FC = () => {
      contextValue = React.useContext(RefreshContext);
      return null;
    };

    render(
      React.createElement(RefreshContextProvider, null,
        React.createElement(TestComponent)
      )
    );

    const initialValue = contextValue.refresh;

    act(() => {
      contextValue.setRefresh(123456);
    });

    expect(contextValue.refresh).toBe(123456);
    expect(contextValue.refresh).not.toBe(initialValue);
  });
});