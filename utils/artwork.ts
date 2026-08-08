/** Upscale iTunes artwork URL to a larger size */
export function upscaleArtwork(url: string | undefined, size = 300): string | undefined {
  if (!url) return undefined;
  return url.replace(/100x100bb/, `${size}x${size}bb`);
}
