import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, Chip, FormControlLabel, IconButton, Paper, Snackbar, Stack, Switch } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ConfigContext } from './app';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 1px;
  gap: 1rem;
`;

const SplitPane = styled.div`
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
`;

const Pane = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    gap: 1rem;
    height: fit-content;
    &:last-child {
        @media screen and (max-width: 600px) {
            width: 96vw;
            padding-bottom: 1rem;
        }
    }
`;

const FormWrapper = styled.div`
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: .8rem;
`;

const TasksPaneItem = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
`;

const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
});
const formatDate = (epoch) => (dateTimeFormat.format(new Date(epoch)));

const TasksPane = ({ loading, disabled, humanTasks, loadDetails, currentTaskId }) => {
    if (humanTasks.length === 0) {
        return loading ? <CircularProgress /> : <Typography>No pending human tasks</Typography>;
    }
    return humanTasks.map((task) => (
        <TasksPaneItem key={task.taskId}>
            <Chip color={currentTaskId === task.taskId ? 'secondary' : undefined} label={formatDate(task.createTime)} />
            <LoadingButton
                variant="contained"
                onClick={() => loadDetails(task)}
                loading={loading}
                disabled={disabled || currentTaskId === task.taskId}
            >
                Open Task Details
            </LoadingButton>
            <Chip color={currentTaskId === task.taskId ? 'info' : undefined}  label={task.displayName} />
        </TasksPaneItem>
    ));
};

const TaskFields = ({ templateDef, originals, setResult }) => {
    const [ innerOutputs, setInnerOutputs ] = useState(originals);
    const updateSwitch = (e, value) => setInnerOutputs((old) => ({ ...old, [e.target.name]: value }));

    useEffect(() => setResult(innerOutputs), [ innerOutputs ]);

    return templateDef.templateUI.elements.map((field) => {
        const fieldName = field.scope.replace('#/properties/', '');
        const dataType = templateDef.jsonSchema.properties[fieldName].type;
        const readonly = !!field.options?.readonly;

        return dataType === 'string' ? readonly ? (
            <Typography key={field.label}>
                <b>{field.label}</b>: {innerOutputs[fieldName]}
            </Typography>
        ) : (
            <TextField
                key={field.label}
                label={field.label}
                name={fieldName}
                value={innerOutputs[fieldName]}
                onChange={({ target }) => setInnerOutputs((old) => ({ ...old, [target.name]: target.value }))}
                InputProps={{ readOnly: readonly }}

            />
        ) : (
            <FormControlLabel
                key={field.label}
                label={field.label}
                disabled={readonly}
                control={<Switch
                    name={fieldName}
                    checked={innerOutputs[fieldName]}
                    onChange={updateSwitch}
                />}
            />
        );
    });
};

const Toast = ({ theme, snackbarOpen, setSnackbarOpen }) => (
    <Snackbar
        open={snackbarOpen}
        onClose={(_, reason) => {
            if (reason !== 'clickaway') {
                setSnackbarOpen(false);
            }
        }}
        ContentProps={{
            sx: { background: theme.palette.primary.main }
        }}
        autoHideDuration={3000}
        message="Task completed"
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

const Approvals = () => {
    const { identity, origin } = useContext(ConfigContext);
    const [ loading, setLoading ] = useState(true);
    const [ humanTasks, setHumanTasks ] = useState([]);
    const [ task, setTask ] = useState();
    const [ templateDef, setTemplateDef ] = useState();
    const [ snackbarOpen, setSnackbarOpen ] = useState(false);
    const [ outputs, setOutputs ] = useState({});
    const theme = useTheme();

    const fetchConfig = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${identity}`,
        },
    };

    const listHumanTasks = () => {
        fetch(`${origin}/demo/api/human-tasks`, fetchConfig)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.error('not ok')
                    throw new Error(JSON.stringify(response));
                }
            })
            .then((response) => setHumanTasks(response.results))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    };

    useEffect(listHumanTasks, []);

    const loadDetails = (t) => {
        setTemplateDef(undefined);
        setLoading(true);
        setTask(t);

        const {
            __humanTaskDefinition,
            __humanTaskProcessContext,
            _createdBy,
            ...originals
        } = t.input;
        setOutputs(originals);

        const template = t.input.__humanTaskDefinition.userFormTemplate;
        const templateName = template.name;
        const templateVersion = template.version;

        fetch(`${origin}/demo/api/human-template?name=${templateName}`, fetchConfig)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.error('not ok')
                    throw new Error(JSON.stringify(response));
                }
            })
            .then((response) => setTemplateDef(response.filter((r) => r.version === templateVersion)[0]))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    };

    const claimAndComplete = (event) => {
        event.preventDefault();
        setLoading(true);

        const postConfig = {
            ...fetchConfig,
            method: 'post',
            body: JSON.stringify(outputs),
        };
        fetch(`${origin}/demo/api/human-tasks/${task.taskId}`, postConfig)
            .then((response) => {
                if (response.ok) {
                    return true;
                } else {
                    console.error('not ok')
                    throw new Error(JSON.stringify(response));
                }
            })
            .then(() => {
                setSnackbarOpen(true);
                setTemplateDef(undefined);
                setTask(undefined);
                listHumanTasks();
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    };

    const reset = () => {
        setTemplateDef(undefined);
        setTask(undefined);
    };

    return (
        <Root>
            <Typography variant="h5">
                Approvals
            </Typography>
            <SplitPane>
                <Pane>
                    <TasksPane
                        loading={loading && !templateDef}
                        disabled={loading && templateDef}
                        humanTasks={humanTasks}
                        loadDetails={loadDetails}
                        currentTaskId={task?.taskId}
                    />
                </Pane>
                <form onSubmit={claimAndComplete}>
                    <Pane>
                        { (loading && humanTasks.length > 0 && !templateDef) && <CircularProgress /> }
                        { templateDef && (
                            <>
                                <Paper elevation={5}>
                                    <FormWrapper>
                                        <Stack direction="row" gap={1} flexWrap="wrap">
                                            <Chip label={task.displayName} color="info" />
                                            <Chip label={task.taskId} />
                                        </Stack>
                                        <TaskFields templateDef={templateDef} originals={outputs} setResult={setOutputs} />
                                        <Stack direction="row" gap={1}>
                                            <LoadingButton color="success" variant="contained" type="submit" loading={loading}>
                                                Claim and Complete
                                            </LoadingButton>
                                            <Button variant="contained" color="inherit" onClick={reset}>
                                                Cancel
                                            </Button>
                                        </Stack>
                                    </FormWrapper>
                                </Paper>
                            </>
                        )}
                    </Pane>
                </form>
            </SplitPane>
            <Toast theme={theme} snackbarOpen={snackbarOpen} setSnackbarOpen={setSnackbarOpen} />
        </Root>
    );
};
export default Approvals;
