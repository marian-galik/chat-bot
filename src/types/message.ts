export interface IMessageOption {
  nextId: number
  value: string | boolean
  text: string
}

export interface IMessage {
  id: number
  type: 'bot' | 'user'
  text: string
  name: string
  options?: IMessageOption[]
}
