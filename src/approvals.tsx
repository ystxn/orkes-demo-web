import CloseIcon from '@mui/icons-material/Close';
import { Button, Chip, FormControlLabel, IconButton, Paper, Snackbar, Stack, Switch } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ConfigContext } from './context';
import { FlexBox } from './shared';
import { Invoice } from './invoice';
import { formatDate } from './shared';

const FormWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: .8rem;
`;

const TasksPaneItem = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
`;

const TasksPaneEmptyState = ({ listHumanTasks }) => {
    const { callApi } = useContext(ConfigContext);
    const [ loading, setLoading ] = useState(false);
    const launchExpensesWorkflow = () =>
        callApi('post', 'start/expense-approvals/1', null, listHumanTasks, null, setLoading);

    return (
        <>
            <Typography>No pending human tasks</Typography>
            <Button
                variant="contained"
                color="secondary"
                onClick={launchExpensesWorkflow}
                loading={loading}
            >
                Launch Expenses Workflow
            </Button>
        </>
    );
}

const TasksPane = ({ loading, disabled, humanTasks, loadDetails, currentTaskId, listHumanTasks }) => {
    if (humanTasks.length === 0) {
        return loading ? <CircularProgress /> : <TasksPaneEmptyState listHumanTasks={listHumanTasks} />;
    }
    return humanTasks.map((task) => (
        <TasksPaneItem key={task.taskId}>
            <Chip color={currentTaskId === task.taskId ? 'secondary' : undefined} label={formatDate(task.createdOn)} />
            <Button
                variant="contained"
                onClick={() => loadDetails(task)}
                loading={loading}
                disabled={disabled || currentTaskId === task.taskId}
            >
                {task.displayName}
            </Button>
        </TasksPaneItem>
    ));
};

const TaskFields = ({ templateDef, originals, setResult }) => {
    if (templateDef.name === 'InvoiceClaimForm') {
        return <Invoice invoice={originals} />
    }
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
                slotProps={{ htmlInput: { readOnly: readonly }}}
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
    const { callApi, clusterUrl } = useContext(ConfigContext);
    const [ loading, setLoading ] = useState(true);
    const [ humanTasks, setHumanTasks ] = useState([]);
    const [ task, setTask ] = useState(null);
    const [ templateDef, setTemplateDef ] = useState(null);
    const [ snackbarOpen, setSnackbarOpen ] = useState(false);
    const [ outputs, setOutputs ] = useState({});
    const theme = useTheme();

    const listHumanTasks = () =>
        callApi('get', 'human-tasks', null, ({ results }) => setHumanTasks(results), null, setLoading);

    useEffect(listHumanTasks, []);

    const loadDetails = (t) => {
        setTemplateDef(null);
        setTask(t);

        const {
            __humanTaskDefinition,
            __humanTaskProcessContext,
            _createdBy,
            ...originals
        } = t.input;
        setOutputs(originals);

        const { name, version } = t.input.__humanTaskDefinition.userFormTemplate;
        const onSuccess = (response) => setTemplateDef(response.filter((r) => r.version === version)[0]);
        callApi('get', `human-template?name=${name}`, null, onSuccess, null, setLoading);
    };

    const claimAndComplete = (event) => {
        event.preventDefault();
        if (!task) {
            return;
        }
        const onSuccess = () => {
            setSnackbarOpen(true);
            setTemplateDef(null);
            setTask(null);
            listHumanTasks();
        };
        callApi('post', `human-tasks/${task.taskId}`, outputs, onSuccess, null, setLoading);
    };

    const reset = () => {
        setTemplateDef(null);
        setTask(null);
    };

    const gotoTask = (taskId) => window.open(`${clusterUrl}/human/task/${taskId}`, '_blank').focus();

    return (
        <>
            <Typography variant="h5" mb={2}>
                Expense Approvals
            </Typography>
            <Paper elevation={5} sx={{ padding: '1rem' }}>
                <FlexBox>
                    <Typography variant="h6">
                        Task List
                    </Typography>
                    <TasksPane
                        loading={loading && !templateDef}
                        disabled={loading && templateDef}
                        humanTasks={humanTasks}
                        loadDetails={loadDetails}
                        currentTaskId={task?.taskId}
                        listHumanTasks={listHumanTasks}
                    />
                </FlexBox>
            </Paper>
            <form onSubmit={claimAndComplete}>
                { (loading && humanTasks.length > 0 && !templateDef) && <CircularProgress /> }
                { (templateDef && task) && (
                    <Paper elevation={5} sx={{ padding: '1rem', margin: '1rem 0' }}>
                        <Typography variant="h6">
                            Task Details
                        </Typography>
                        <FormWrapper>
                            <Stack direction="row" gap={1} flexWrap="wrap">
                                <Chip label={task.displayName} color="info" />
                                <Chip label={task.taskId} onClick={() => gotoTask(task.taskId)} />
                            </Stack>
                            <TaskFields
                                templateDef={templateDef}
                                originals={outputs}
                                setResult={setOutputs}
                            />
                            <Stack direction="row" gap={1}>
                                <Button color="info" variant="contained" type="submit" loading={loading}>
                                    Submit
                                </Button>
                                <Button variant="contained" color="inherit" onClick={reset}>
                                    Cancel
                                </Button>
                            </Stack>
                        </FormWrapper>
                    </Paper>
                )}
            </form>

            <Toast theme={theme} snackbarOpen={snackbarOpen} setSnackbarOpen={setSnackbarOpen} />
        </>
    );
};
export default Approvals;
