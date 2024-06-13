import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FaceIcon from '@mui/icons-material/Face';
import Face2Icon from '@mui/icons-material/Face2';
import LoadingButton from '@mui/lab/LoadingButton';
import { IconButton, Stack, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import './news-index-search.css';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 1px;
  gap: 1rem;
`;

const MessageStack = styled(Stack)`
  overflow-y: auto;
  flex: 1 1 1px;
  gap: .8em;
`

const BubbleRoot = styled.div`
  color: ${props => props.color};
  border-color: ${props => props.color};
  border-width: 1px;
  border-style: solid;
  border-radius: .8rem;
  display: flex;
  gap: .5rem;
  align-self: flex-start;
  align-items: center;
  padding: .5rem;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  font-size: .9rem;
  white-space: pre;
`;

const Bubble = ({ message, color, icon }) => (
  <BubbleRoot color={color}>
    { icon } { message }
  </BubbleRoot>
);

const NewsIndexSearch = ({ identity }) => {
  const [ loading, setLoading ] = useState(false);
  const [ messages, setMessages ] = useState([]);
  const [ input, setInput ] = useState("List the top 5 companies by their recently reported results");
  const origin = window.location.hostname === 'localhost' ? 'http://localhost:8080' : '';

  const scrollToBottom = () => {
    const messageList = document.querySelector('#message-list');
    messageList.scrollTop = messageList.scrollHeight;
  };

  useEffect(() => {
    const storedMessages = window.localStorage.getItem('messages');
    setMessages(storedMessages ? JSON.parse(storedMessages) : [ 'Hello there' ]);
  }, []);

  useEffect(() => {
    if (messages?.length > 0) {
      setTimeout(scrollToBottom, 50);
      window.localStorage.setItem('messages', JSON.stringify(messages));
    }
  } , [ messages ]);

  const addMessage = (newMessage) => setMessages((old) => [ ...old, newMessage ]);

  const fireQuery = () => {
    setLoading(true);
    addMessage(input);

    const config = {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${identity}`,
      },
      body: JSON.stringify({ query: input }),
    };
    fetch(`${origin}/demo/api/execute/news-context-search/1`, config)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          console.log('not ok')
          throw new Error(JSON.stringify(response));
        }
      })
      .then((response) => addMessage(response.result))
      .catch((error) => {
        console.log(error)
        setMessages((old) => [ ...old, 'Error: ' + error ]);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Root>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5">
          News Index Search
        </Typography>
        <IconButton color="error" onClick={() => setMessages([ 'Hello there' ])}>
          <DeleteForeverIcon />
        </IconButton>
      </Stack>
      <MessageStack id="message-list">
          { messages.map((message, index) => (
            <Bubble
              key={index}
              message={message}
              color={index % 2 === 0 ? 'rgb(25, 118, 210)' : 'rgb(156, 39, 176)'}
              icon={index % 2 === 0 ? <FaceIcon /> : <Face2Icon />}
            />
          )) }
      </MessageStack>
      <Stack gap={2} direction="row">
        <TextField
          fullWidth
          label="Query"
          multiline
          rows={2}
          disabled={loading}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <LoadingButton
          variant="contained"
          loading={loading}
          onClick={fireQuery}
        >
          Ask
        </LoadingButton>
      </Stack>
    </Root>
  )
};

export default NewsIndexSearch;
