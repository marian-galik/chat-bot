import type { IMessage, IMessageOption } from '../types/message'
import { Button, Grid, ListItem, ListItemText } from '@material-ui/core'

interface BotMessageProps {
  message: IMessage
  onOptionSelect?: (message: IMessage, option: IMessageOption) => void
}
const BotMessage = ({ message, onOptionSelect }: BotMessageProps) => (
  <ListItem>
    <Grid container>
      <Grid item xs={12}>
        <ListItemText>{message.text}</ListItemText>
      </Grid>
      {onOptionSelect && message.options && (
        <Grid item xs={12}>
          <ListItemText>
            {message.options.map((option: IMessageOption) => (
              <Button
                key={String(option.value)}
                onClick={() => onOptionSelect(message, option)}
              >
                {option.text}
              </Button>
            ))}
          </ListItemText>
        </Grid>
      )}
    </Grid>
  </ListItem>
)

export default BotMessage
