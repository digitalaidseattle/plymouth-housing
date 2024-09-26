/**
 *  AzureAuth.test.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { render } from '@testing-library/react';
import { afterEach, assert, describe, expect, it, vi } from 'vitest';
import { authService } from '../../../services/authService';
import AzureAuth from './AzureAuth';
import { OAuthResponse } from '@supabase/supabase-js';

// ==============================|| FIREBASE - SOCIAL BUTTON ||============================== //

describe('AzureAuth tests', () => {
  it('should render the app', () => {
    const element = render(<AzureAuth />);
    assert.isNotNull(element.queryByText('Google'));
    assert.isNotNull(element.queryByText('Microsoft'));
  });

  it('Google button should work', async () => {
    const resp = Promise.resolve({ data: { url: 'URL' } } as OAuthResponse);
    const signInWithGoogleSpy = vi
      .spyOn(authService, 'signInWithGoogle')
      .mockReturnValue(resp);
    // const loggingSpy = vi.spyOn(loggingService, 'info')

    const element = render(<AzureAuth />);
    const button = element.queryByTitle('Login with Google');
    button?.click();
    await resp;
    expect(signInWithGoogleSpy).toHaveBeenCalledTimes(1);
    // expect(loggingSpy).toHaveBeenCalledWith('Logged in with Google: URL')
  });

  it('Microsoft button should  work', async () => {
    const signInWithAzureeSpy = vi
      .spyOn(authService, 'signInWithAzure')
      .mockReturnValue(
        Promise.resolve({ data: { url: 'URL' } } as OAuthResponse),
      );
    // const loggingSpy = vi.spyOn(loggingService, 'info')

    const element = render(<AzureAuth />);
    const button = element.queryByTitle('Login with Microsoft');

    button?.click();

    expect(signInWithAzureeSpy).toHaveBeenCalledTimes(1);
    // expect(loggingSpy).toHaveBeenCalledWith('Logged in with Azure');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
