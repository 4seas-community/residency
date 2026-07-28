export const ABOUT_RESPONSE_CHARACTER_LIMIT = 300

export function getRemainingAboutCharacters(text: string): number {
  return ABOUT_RESPONSE_CHARACTER_LIMIT - text.length
}

export function isAboutResponseOverCharacterLimit(text: string): boolean {
  return text.length > ABOUT_RESPONSE_CHARACTER_LIMIT
}
