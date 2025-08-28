import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FaceIcon from '@mui/icons-material/Face';
import Face2Icon from '@mui/icons-material/Face2';
import { Button, IconButton, MenuItem, Select, Stack, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ConfigContext } from './context';

const MessageStack = styled(Stack)`
  overflow-y: auto;
  flex: 1 1 1px;
  gap: .8em;
  padding-right: .5rem;
  padding-bottom: .5rem;
`

const BubbleRoot = styled.div<{ color?: string }>`
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

const BubbleLink = styled(Link)`
  color: inherit;
`;

const Bubble = ({ message, executionId, color, icon, clusterUrl }) => (
  <BubbleRoot color={color}>
    { executionId ? <BubbleLink target="_blank" to={`${clusterUrl}/execution/${executionId}`}>{icon}</BubbleLink> : icon }
    { message }
  </BubbleRoot>
);

interface Message {
  result: string;
  executionId?: string;
}

const defaultMessages = [{ result: 'Hello there' }];

const SemanticSearch = () => {
  const { callApi, clusterUrl, profile } = useContext(ConfigContext);
  const [ loading, setLoading ] = useState(false);
  const [ messages, setMessages ] = useState<Message[]>(defaultMessages);
  const [ input, setInput ] = useState('');
  const [ domain, setDomain ] = useState('policy');
  const [ placeholder, setPlaceholder ] = useState('');
  const [ workflowName, setWorkflowName ] = useState('');

  const domainMap = {
    policy: {
      placeholder: 'How long will expired account data will be retained for?',
      workflowName: 'policy-search/2',
    },
    finance: {
      placeholder: 'Which companies performed the best in the last quarter?',
      workflowName: 'news-context-search/1',
    },
    books: {
      placeholder: 'Why did Dorothy not realise the wizard was fake?',
      workflowName: 'books-search/2',
    },
  };

  const scrollToBottom = () => {
    const messageList = document.querySelector('#message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
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
    } else {
      if (window.localStorage.getItem('messages')) {
        window.localStorage.removeItem('messages');
      }
    }
  } , [ messages ]);

  useEffect(() => {
    setPlaceholder(domainMap[domain].placeholder);
    setWorkflowName(domainMap[domain].workflowName);
  }, [ domain ])

  const fireQuery = () => {
    setMessages((old) => [ ...old, { result: input } ]);

    const onSuccess = (response) => {
      const executionId = response.workflowId;
      const { result } = response.output;
      setMessages((old) => [
        ...old.map((message, index) => (index < old.length - 1) ? message : { ...message, executionId }),
        { result, executionId }
      ]);
      setInput('');
    };
    const onError = (error) => setMessages((old) => [ ...old, { result: 'Error: ' + error } ]);
    const data = { query: input, correlationId: profile.email };
    callApi('post', `execute/${workflowName}`, data, onSuccess, onError, setLoading);
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" gap={2}>
          <Typography variant="h5">
            Semantic Search for
          </Typography>
          <Select
            size="small"
            value={domain}
            onChange={({ target }) => setDomain(target.value)}
            sx={{ fontWeight: 500 }}
          >
            <MenuItem value="policy">Orkes Policies</MenuItem>
            <MenuItem value="finance">Financial News</MenuItem>
            <MenuItem value="books">Story Books</MenuItem>
          </Select>
        </Stack>

        <IconButton
          color="error"
          onClick={() => setMessages(defaultMessages)}
          disabled={messages.length === 1}
        >
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
              clusterUrl={clusterUrl}
            />
          )) }
      </MessageStack>
      <Stack gap={2} direction="row">
        <TextField
          fullWidth
          multiline
          rows={2}
          disabled={loading}
          value={input}
          placeholder={placeholder}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={({ key }) => (key === 'Enter') && fireQuery()}
        />
        <Button
          variant="contained"
          loading={loading}
          onClick={fireQuery}
        >
          Ask
        </Button>
      </Stack>
    </>
  )
};

export default SemanticSearch;
