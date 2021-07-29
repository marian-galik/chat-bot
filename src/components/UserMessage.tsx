import type { IMessage } from '../types/message'
import { ListItem, ListItemText } from '@material-ui/core'

interface UserMessageProps {
  message: IMessage
}
const UserMessage = ({ message }: UserMessageProps) => (
  <ListItem>
    <ListItemText primaryTypographyProps={{ align: 'right' }}>
      {message.text}
    </ListItemText>
  </ListItem>
)

export default UserMessage
