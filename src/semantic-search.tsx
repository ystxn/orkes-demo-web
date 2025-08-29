import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FaceIcon from '@mui/icons-material/Face';
import Face2Icon from '@mui/icons-material/Face2';
import { Button, IconButton, MenuItem, Select, Snackbar, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
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

const Toast = ({ theme, snackbarOpen, setSnackbarOpen, errorMessage }) => (
    <Snackbar
    open={snackbarOpen}
    onClose={(_, reason) => {
        if (reason !== 'clickaway') {
            setSnackbarOpen(false);
        }
    }}
    sx={{
        '& .MuiSnackbarContent-root': {
            background: theme.palette.error.main,
            position: 'relative',
            bottom: '5.5rem',
            left: '-0.5rem',
        }
    }}
    autoHideDuration={5000}
    message={errorMessage}
    action={
        <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
        >
        <CloseIcon fontSize="small" />
        </IconButton>
    }
    />
);

const SemanticSearch = () => {
    const { callApi, clusterUrl, profile } = useContext(ConfigContext);
    const [ loading, setLoading ] = useState(false);
    const [ messages, setMessages ] = useState<Message[]>(defaultMessages);
    const [ input, setInput ] = useState('');
    const [ domain, setDomain ] = useState('policy');
    const [ placeholder, setPlaceholder ] = useState('');
    const [ workflowName, setWorkflowName ] = useState('');
    const [ snackbarOpen, setSnackbarOpen ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState('');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            if (response.status !== 'COMPLETED') {
                const tasks = response.tasks;
                const error = 'Error: ' + tasks[tasks.length - 1].reasonForIncompletion;
                setErrorMessage(error);
                setSnackbarOpen(true);
                setMessages((old) => old.slice(0, -1));
                return;
            }
            const executionId = response.workflowId;
            const { result } = response.output;
            setMessages((old) => [
                ...old.map((message, index) => (index < old.length - 1) ? message : { ...message, executionId }),
                { result, executionId }
            ]);
            setInput('');
        };

        const onError = (error) => {
            setMessages((old) => old.slice(0, -1));

            if (error.message) {
                const parsedError = JSON.parse(error.message);
                setErrorMessage(parsedError.message || parsedError.error);
            } else {
                setErrorMessage(error);
            }
            setSnackbarOpen(true);
        };

        const data = { query: input, correlationId: profile.email };
        callApi('post', `execute/${workflowName}`, data, onSuccess, onError, setLoading);
    };

    return (
        <>
            <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" gap={2} alignItems="center">
                    <Typography variant="h5" sx={{ whiteSpace: 'nowrap' }}>
                        { isMobile ? 'Search' : 'Semantic Search for' }
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
                <Stack direction="row" gap={1}>
                    <Button
                        variant="outlined"
                        component={Link}
                        to={`${clusterUrl}/executions?workflowType=${workflowName.split('/')[0]}`}
                        target="_blank"
                        sx={{ display: { 'xs': 'none', 'sm': 'flex' } }}
                    >
                        View Executions
                    </Button>
                    <IconButton
                        color="error"
                        onClick={() => setMessages(defaultMessages)}
                        disabled={messages.length === 1}
                    >
                        <DeleteForeverIcon />
                    </IconButton>
                </Stack>
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
                ))}
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
            <Toast
                theme={theme}
                snackbarOpen={snackbarOpen}
                setSnackbarOpen={setSnackbarOpen}
                errorMessage={errorMessage}
            />
        </>
    )
};

export default SemanticSearch;
