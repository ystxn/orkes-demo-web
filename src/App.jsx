import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FaceIcon from '@mui/icons-material/Face';
import Face2Icon from '@mui/icons-material/Face2';
import SettingsIcon from '@mui/icons-material/Settings';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, Chip, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import './App.css';

const messageListStyles = {
  height: 'calc(100vh - 12rem)',
  overflowY: 'auto'
};

const chipStyles = {
  alignSelf: 'flex-start',
  padding: '1.2rem .5rem',
};

const SettingsDialog = ({ open, setOpen, domain, setDomain, token, setToken }) => {
  const handleClose = (_, reason) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Stack gap={1}>
          <DialogContentText>
            Set your cluster's domain and copy the token
          </DialogContentText>
          <TextField
            required
            margin="dense"
            name="cluster"
            label="Cluster Subdomain"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            fullWidth
          />
          <TextField
            required
            margin="dense"
            name="token"
            label="Token Subdomain"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleClose}>Close</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

const App = () => {
  const [ settingsDialogOpen, setSettingsDialogOpen ] = useState(false);
  const [ domain, setDomain ] = useState(null);
  const [ token, setToken ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ messages, setMessages ] = useState([]);
  const [ input, setInput ] = useState("List the top 5 companies by their recently reported results");

  useEffect(() => {
    setDomain(window.localStorage.getItem('domain') || 'ys');
    setToken(window.localStorage.getItem('token') || '');
    const storedMessages = window.localStorage.getItem('messages');
    setMessages(storedMessages ? JSON.parse(storedMessages) : [ 'Hello there' ]);
  }, []);

  useEffect(() => {
    if (domain) {
      window.localStorage.setItem('domain', domain);
    }
  }, [ domain ]);
  useEffect(() => {
    if (token) {
      window.localStorage.setItem('token', token);
    }
  }, [ token ]);
  useEffect(() => {
    if (messages?.length > 0) {
      window.localStorage.setItem('messages', JSON.stringify(messages));
    }
  } , [ messages ]);

  const addMessage = (newMessage) => {
    setMessages((old) => [ ...old, newMessage ]);
    setTimeout(() => {
      const messageList = document.querySelector('#message-list');
      messageList.scrollTop = messageList.scrollHeight;
    }, 50);
  };

  const fireQuery = () => {
    setLoading(true);
    addMessage(input);

    const config = {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        token,
        path: '/api/workflow/execute/news-context-search',
        body: { query: input },
      }),
    };
    fetch('/express-api/', config)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(JSON.stringify(response));
        }
      })
      .then((response) => {
        addMessage(response.result);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setMessages((old) => [ ...old, 'Error: ' + error ])
      });
  };

  return (
    <Stack gap={2} flexGrow={1}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5">
          News Index Search
        </Typography>
        <Stack direction="row">
          <IconButton color="error" onClick={() => setMessages([ 'Hello there' ])}>
            <DeleteForeverIcon />
          </IconButton>
          <IconButton color="info" onClick={() => setSettingsDialogOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </Stack>
      </Stack>
      <Stack id="message-list" flexGrow={1} gap={1.5} sx={messageListStyles}>
          { messages.map((message, index) => (
            <Chip
              key={index}
              label={message}
              variant="outlined"
              color={index % 2 === 0 ? 'primary' : 'secondary'}
              icon={index % 2 === 0 ? <FaceIcon /> : <Face2Icon />}
              sx={chipStyles}
            />
          )) }
      </Stack>
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
      <SettingsDialog
        open={settingsDialogOpen}
        setOpen={setSettingsDialogOpen}
        domain={domain}
        setDomain={setDomain}
        token={token}
        setToken={setToken}
      />
    </Stack>
  )
};

export default App;
