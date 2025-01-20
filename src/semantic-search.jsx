import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FaceIcon from '@mui/icons-material/Face';
import Face2Icon from '@mui/icons-material/Face2';
import LoadingButton from '@mui/lab/LoadingButton';
import { IconButton, Stack, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ConfigContext } from './app';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 1px;
  gap: 1rem;
  a,a:visited,a:active { color: inherit}
`;

const MessageStack = styled(Stack)`
  overflow-y: auto;
  flex: 1 1 1px;
  gap: .8em;
  padding-right: .5rem;
  padding-bottom: .5rem;
`

const BubbleRoot = styled.div`
  color: ${props => props.color};
  border-color: ${props => props.color};
  border-width: 1px;
  border-style: solid;
  border-radius: .6rem;
  display: flex;
  gap: .5rem;
  align-self: flex-start;
  align-items: center;
  padding: .5rem;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  font-size: .9rem;
  white-space: break-spaces;
`;

const Bubble = ({ message, executionId, color, icon }) => (
  <BubbleRoot color={color}>
    { executionId ? <Link target="_blank" to={`https://ys.orkesconductor.io/execution/${executionId}`}>{icon}</Link> : icon }
    { message }
  </BubbleRoot>
);

const defaultMessages = [{ result: 'Hello there' }];

const SemanticSearch = () => {
  const { callApi } = useContext(ConfigContext);
  const [ loading, setLoading ] = useState(false);
  const [ messages, setMessages ] = useState(defaultMessages);
  const [ input, setInput ] = useState('Why did dorothy not realize the wizard was fake?');

  const scrollToBottom = () => {
    const messageList = document.querySelector('#message-list');
    messageList.scrollTop = messageList.scrollHeight;
  };

  useEffect(() => {
    const storedMessages = window.localStorage.getItem('messages');
    if (storedMessages) {
      const parsed = JSON.parse(storedMessages);
      const valid = typeof parsed[0] === 'object';
      setMessages(valid ? parsed : defaultMessages);
    }
  }, []);

  useEffect(() => {
    if (messages?.length > 1) {
      setTimeout(scrollToBottom, 50);
      window.localStorage.setItem('messages', JSON.stringify(messages));
    }
  } , [ messages ]);

  const fireQuery = () => {
    setMessages((old) => [ ...old, { result: input } ]);

    const onSuccess = (response) => {
      setMessages((old) => [
        ...old.map((message, index) => (index < old.length - 1) ? message : { ...message, executionId: response.executionId }),
        response
      ]);
      setInput('');
    };
    const onError = (error) => setMessages((old) => [ ...old, { result: 'Error: ' + error } ]);
    callApi('post', 'execute/books-search', { query: input }, onSuccess, onError, setLoading);
  };

  return (
    <Root>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5">
          Semantic Search
        </Typography>
        <IconButton color="error" onClick={() => setMessages(defaultMessages)}>
          <DeleteForeverIcon />
        </IconButton>
      </Stack>
      <MessageStack id="message-list">
          { messages.map((message, index) => (
            <Bubble
              key={index}
              message={message.result}
              executionId={message.executionId}
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
          onKeyDown={({ key }) => (key === 'Enter') && fireQuery()}
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

export default SemanticSearch;
