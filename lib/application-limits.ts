export const APPLICATION_RESPONSE_CHARACTER_LIMIT = 300
export const ABOUT_RESPONSE_CHARACTER_LIMIT = APPLICATION_RESPONSE_CHARACTER_LIMIT

export function getRemainingCharacters(text: string): number {
  return APPLICATION_RESPONSE_CHARACTER_LIMIT - text.length
}

export function isResponseOverCharacterLimit(text: string): boolean {
  return text.length > APPLICATION_RESPONSE_CHARACTER_LIMIT
}

export function getRemainingAboutCharacters(text: string): number {
  return getRemainingCharacters(text)
}

export function isAboutResponseOverCharacterLimit(text: string): boolean {
  return isResponseOverCharacterLimit(text)
}
