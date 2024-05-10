import LoadingButton from '@mui/lab/LoadingButton';
import { Chip, Stack, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import FaceIcon from '@mui/icons-material/Face';
import Face2Icon from '@mui/icons-material/Face2';
import './App.css';

const messageListStyles = {
  height: 'calc(100vh - 12rem)',
  overflowY: 'auto'
};

const chipStyles = {
  alignSelf: 'flex-start',
  padding: '1.2rem .5rem',
};

const App = () => {
  const [ domain, setDomain ] = useState('ys');
  const [ token, setToken ] = useState('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtqbVlNWThEV2VOU1lKZmZSSjFXNSJ9.eyJnaXZlbl9uYW1lIjoiWW9uZyBTaGVuZyIsImZhbWlseV9uYW1lIjoiVGFuIiwibmlja25hbWUiOiJ5b25nc2hlbmcudGFuIiwibmFtZSI6IllvbmcgU2hlbmcgVGFuIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0oxc0R5RTh2eS1TUUNoTUF1OFp3dVdFOGl5SVFRZGtJZnN0NkIxQWI5bkNXcHNHQT1zOTYtYyIsImxvY2FsZSI6ImVuIiwidXBkYXRlZF9hdCI6IjIwMjQtMDUtMTBUMDI6MTQ6MzMuODcxWiIsImVtYWlsIjoieW9uZ3NoZW5nLnRhbkBvcmtlcy5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2F1dGgub3JrZXMuaW8vIiwiYXVkIjoiQzAwRlVaUW5BaEJCOU54cGtEaWtnazVZb25DOFVpa1ciLCJpYXQiOjE3MTUzMDcyNzQsImV4cCI6MTcxNTM0MzI3NCwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDk0NTkxNjM0OTM5NTg0NjU5NDciLCJzaWQiOiJ6VVl2RmdvTDE5cHc2UnpvbHphQ3JKQmo5UkNJN2w1QSIsIm5vbmNlIjoiU21OV1ZGOU9ValJaWkdSWmNUazNXVkJqUTAxMmRIQkNjVWhxY1ZCbWFXcGFUMDFXWDNsaGNuWnlNdz09In0.E6xxxDv6cf4O88SaP7DHp_-mxGlMBSchz9gpgxXYeUGtth5OOw7Q-ay5m7Gu68zbv_8XdBVXZ8zbAMrG-JOof0Bp25f53glFq1E1aUFUT95mmqrEgcQMi8lG7AOqtYhLtas4ts2AU2tLBO_VuD5GNOvhmNNEm_ZOd3Fi-VCOL4OtbROiiRCuEIv4MgT7s257X5OHIWkPs2O1nGKzaR0H1A3ewwivrP3gnX6cSpa1_byhSRxH6V1JfoNtCmxaMHMWY1LASKfsf48MPqtaSeYZctko8dSAqIfvUxyFBXK7clL8BXFEziU6rHKoN8wvag1y_R0woOHcxnjYqhk_nSK9NA');
  const [ loading, setLoading ] = useState(false);
  const [ messages, setMessages ] = useState([ "Hello, there" ]);
  const [ input, setInput ] = useState("List the top 5 companies by their recently reported results");

  useEffect(() => {
    const data = [
      "hello, there",
      "yes okay"
    ];
    setMessages(data);
  }, []);

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
      .then((response) => response.json())
      .then((response) => {
        addMessage(response.result);
        setLoading(false);
      });
  };

  return (
    <Stack gap={2} flexGrow={1}>
      <Typography variant="h5">
        News Index Search
      </Typography>
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
    </Stack>
  )
};

export default App;
