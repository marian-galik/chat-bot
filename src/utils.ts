import type { IMessage } from './types/message'

/**
 * Generate random number
 */
export const randNumber = (): number => Math.round(Date.now() * Math.random())

/**
 * Create message object
 * @param  {string} text
 * @param  {'bot'|'user'} type
 * @returns IMessage
 */
export const createMessage = (
  text: string,
  type: 'bot' | 'user'
): IMessage => ({
  id: randNumber(), // todo: in the future use uuidv4() instead
  name: "",
  text,
  type,
})

/**
 * Create bot message object
 * @param  {string} text
 * @param  {object} options
 * @returns IMessage
 */
export const createBotMessage = (text: string, options?: object): IMessage => ({
  ...createMessage(text, 'bot'),
  ...options,
})

/**
 * Create user message object
 * @param  {string} text
 */
export const createUserMessage = (text: string): IMessage =>
  createMessage(text, 'user')

/**
 * Check if message object was created by bot
 * @param  {IMessage} {type}
 * @returns boolean
 */
export const isBotMessage = ({ type }: IMessage): boolean => type === 'bot'
