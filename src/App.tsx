import type { FC, ChangeEvent, FormEvent, ReactNode } from 'react'
import type { IMessage, IMessageOption } from './types/message'
import type { ISelectedOption } from './types/selectedOption'
import { useEffect, useState, useRef } from 'react'
import { Fab, Grid, List, Paper, TextField } from '@material-ui/core'
import { Send as SendIcon } from '@material-ui/icons'
import { createUseStyles } from 'react-jss'
import axios from 'axios'
import { createUserMessage, createBotMessage, isBotMessage } from './utils'
import { BotMessage, UserMessage } from './components'

const App: FC = () => {
  const classes = useStyles()
  const [flowData, setFlowData] = useState<any>([])
  const [messages, setMessages] = useState<IMessage[]>([])
  const [selectedOptions, setSelectedOptions] = useState<ISelectedOption[]>([])

  const [inputValue, setInputValue] = useState<string>('')
  const listRef = useRef<HTMLDivElement>(null)

  /**
   * Handle input message change
   * @param  {e} event
   */
  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  /**
   * Handle input message form submit
   * @param  {e} event
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // add input message to thread
    let updatedMessages = [...messages, createUserMessage(inputValue)]

    // check if text answer match with one of option in last message
    const lastMessage = messages.slice(-1)[0]
    if (lastMessage) {
      const selectedOption = lastMessage.options?.find(
        (option: IMessageOption) =>
          option.text.toLowerCase() === inputValue.toLowerCase()
      )
      if (selectedOption) {
        // find message in flow data by nextId
        const botMessage = generateNextFlowMessage(selectedOption.nextId)

        // add message to thread
        updatedMessages = [...updatedMessages, botMessage]
      }
    }

    // update messages
    setMessages(updatedMessages)

    // reset input value
    setInputValue('')
  }

  /**
   * Handle option select
   * @param  {object} message
   * @param  {object} selectedOption
   */
  const onOptionSelect = (
    message: IMessage,
    selectedOption: IMessageOption
  ) => {
    // save selected option
    const newOption = {
      name: message.name,
      value: selectedOption.value,
    }
    setSelectedOptions([...selectedOptions, newOption])

    // create user message + add to thread
    const userMessage = createUserMessage(selectedOption.text)
    const updatedMessages = [...messages, userMessage]

    // go to next step (based on selected option)
    const nextId = selectedOption.nextId

    // finish
    if (!nextId) {
      const botMessage = createBotMessage('Herzlichen Dank für Ihre Angaben')
      setMessages([...updatedMessages, botMessage])
      postConversation()
      return
    }

    // find message in flow data by nextId
    const botMessage = generateNextFlowMessage(nextId)

    // add message to thread
    setMessages([...updatedMessages, botMessage])
  }

  /**
   * Generate next message from flow
   * @param  {number} nextId
   */
  const generateNextFlowMessage = (nextId: number) => {
    // find message in flow data by nextId
    const nextFlowMessage = flowData.find(
      (message: any) => message.id === nextId
    )

    // create bot message
    return createBotMessage(nextFlowMessage.text, {
      name: nextFlowMessage.name,
      options: nextFlowMessage.valueOptions,
    })
  }

  /**
   * Main render messages function
   */
  const renderMessages = (): ReactNode =>
    messages.map((message: IMessage, index: number) => {
      if (!isBotMessage(message)) {
        return <UserMessage key={message.id} message={message} />
      }
      return (
        <BotMessage
          key={message.id}
          message={message}
          onOptionSelect={onOptionSelect}
        />
      )
    })

  /**
   * Fetch flow data from server
   */
  const getFlowData = async () => {
    try {
      const { data } = await axios.get(
        'https://raw.githubusercontent.com/mzronek/task/main/flow.json'
      )
      setFlowData(data)
      return data
    } catch (error) {
      console.error(error)
      alert('Error while fetching flow data!')
    }
  }

  /**
   * Submit conversation data
   */
  const postConversation = async () => {
    try {
      await axios.put(
        'https://virtserver.swaggerhub.com/L8475/task/1.0.0/conversation',
        selectedOptions
      )
    } catch (error) {
      console.error(error)
      alert('Error while posting conversation data!')
    }
  }

  /**
   * Initialize chat
   * create first bot message
   */
  const initializeChat = async () => {
    // get flow data from server
    const flowData = await getFlowData()
    const initId = 100

    // pick first step from flow
    const initMessage = flowData.find((message: any) => message.id === initId)

    // create initial message
    const botMessage = createBotMessage(initMessage.text, {
      name: initMessage.name,
      options: initMessage.valueOptions,
    })

    // add message to thread
    setMessages([...messages, botMessage])
  }

  const scrollIntoView = (): void => {
    setTimeout(() => {
      const ref = listRef.current
      if (ref) {
        ref.scrollTop = ref.scrollHeight
      }
    }, 75)
  }

  useEffect(() => {
    initializeChat()
  }, [])

  useEffect(() => {
    scrollIntoView()
  }, [messages])

  return (
    <Grid
      container
      component={Paper}
      elevation={3}
      spacing={3}
      className={classes.root}
    >
      <Grid item xs={12}>
        <div ref={listRef} className={classes.listWrapper}>
          <List className={classes.list}>{renderMessages()}</List>
        </div>
        <Grid container className={classes.controlsWrapper}>
          <form onSubmit={handleSubmit} className={classes.form}>
            <Grid item xs={10}>
              <TextField
                placeholder="Enter message here"
                variant="outlined"
                fullWidth
                onChange={onInputChange}
                value={inputValue}
              />
            </Grid>
            <Grid item xs={2} className={classes.submitWrapper}>
              <Fab color="secondary" type="submit">
                <SendIcon />
              </Fab>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Grid>
  )
}

const useStyles = createUseStyles({
  root: {
    minWidth: 380,
    maxWidth: 500,
    margin: 'auto',
  },
  listWrapper: {
    overflow: 'auto',
    height: '70vh',
  },
  list: {
    width: '100%',
  },
  submitWrapper: {
    textAlign: 'center',
  },
  controlsWrapper: {
    paddingTop: '12px',
  },
  form: {
    display: 'flex',
    width: '100%',
  },
})

export default App
