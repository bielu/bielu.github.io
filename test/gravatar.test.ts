import { describe, expect, it, vi } from 'vitest';
import { fetchAvatar, gravatarUrl, initials } from '../src/lib/gravatar';

describe('gravatarUrl', () => {
  it('gravatarUrl_HashesNormalisedEmail', async () => {
    // Arrange / Act
    const url = await gravatarUrl('  Someone@Example.com ', 96);

    // Assert
    expect(url).toBe(await gravatarUrl('someone@example.com', 96));
    // SHA-256 of "someone@example.com".
    expect(url).toContain('72497f475e4f76d0b28f57c73a084ece576d170874eba3ee2609d9afe4b71aab');
    expect(url).toMatch(/^https:\/\/gravatar\.com\/avatar\/[0-9a-f]{64}\?s=96&d=404$/);
    expect(url).not.toContain('example');
  });
});

describe('fetchAvatar', () => {
  it('fetchAvatar_ReturnsUndefinedWithoutEmail', async () => {
    // Arrange
    const fetchImpl = vi.fn<typeof fetch>();

    // Act
    const avatar = await fetchAvatar(undefined, 96, fetchImpl);

    // Assert
    expect(avatar).toBeUndefined();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('fetchAvatar_ReturnsDataUri', async () => {
    // Arrange
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { 'content-type': 'image/jpeg' } }),
    );

    // Act
    const avatar = await fetchAvatar('someone@example.com', 96, fetchImpl);

    // Assert
    expect(avatar).toBe('data:image/jpeg;base64,AQID');
  });

  it('fetchAvatar_ReturnsUndefinedWhenGravatarHasNoAvatar', async () => {
    // Arrange
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 404 }));

    // Act / Assert
    await expect(fetchAvatar('someone@example.com', 96, fetchImpl)).resolves.toBeUndefined();
  });

  it('fetchAvatar_ThrowsOnOtherFailures', async () => {
    // Arrange
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 }));

    // Act / Assert
    await expect(fetchAvatar('someone@example.com', 96, fetchImpl)).rejects.toThrow('503');
  });
});

describe('initials', () => {
  it('initials_TakesFirstLetterOfEachWord', () => {
    expect(initials('Arkadiusz Biel')).toBe('AB');
    expect(initials('  ada  ')).toBe('A');
  });
});
