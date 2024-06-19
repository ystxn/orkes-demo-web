import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from "@mui/lab/LoadingButton";
import { FormControlLabel, IconButton, Snackbar, Switch } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { ConfigContext } from "./app";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 1px;
  gap: 1rem;
`;

const SplitPane = styled.div`
    display: flex;
    flex: 1 1 1px;
    gap: 5rem;
`;

const Pane = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    &:last-child { width: 40vw }
`;

const Approvals = () => {
    const { identity, origin } = useContext(ConfigContext);
    const [ loading, setLoading ] = useState(true);
    const [ humanTasks, setHumanTasks ] = useState([]);
    const [ task, setTask ] = useState({});
    const [ templateDef, setTemplateDef ] = useState();
    const [ outputs, setOutputs ] = useState({});
    const [ snackbarOpen, setSnackbarOpen ] = useState(false);
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

    const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    });
    const formatDate = (epoch) => (dateTimeFormat.format(new Date(epoch)));

    const updateSwitch = (e, value) => setOutputs((old) => ({ ...old, [e.target.name]: value }));

    const TaskFields = () => templateDef.templateUI.elements.map((field) => {
        const fieldName = field.scope.replace('#/properties/', '');
        const dataType = templateDef.jsonSchema.properties[fieldName].type;
        const readonly = !!field.options?.readonly;

        return dataType === 'string' ? (
            <TextField
                key={field.label}
                label={field.label}
                name={fieldName}
                defaultValue={task.input[fieldName]}
                InputProps={{ readOnly: readonly }}
                disabled={readonly}
            />
        ) : (
            <FormControlLabel
                key={field.label}
                label={field.label}
                disabled={readonly}
                control={<Switch
                    name={fieldName}
                    checked={outputs[fieldName]}
                    onChange={updateSwitch}
                />}
            />
        );
    });

    const loadDetails = (t) => {
        setTemplateDef(undefined);
        setOutputs({});
        setLoading(true);
        setTask(t);

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

        const {
            __humanTaskDefinition,
            __humanTaskProcessContext,
            _createdBy,
            ...originals
        } = task.input;

        const values = {
            ...originals,
            ...Object.fromEntries(new FormData(event.target).entries()),
            ...outputs
        };

        const postConfig = {
            ...fetchConfig,
            method: 'post',
            body: JSON.stringify(values),
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
                listHumanTasks();
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    };

    return (
        <Root>
            <Typography variant="h5">
                Approvals
            </Typography>
            <SplitPane>
                <Pane>
                    { (loading && humanTasks.length === 0) ? <CircularProgress /> : humanTasks.map((task) => (
                        <div key={task.taskId}>
                            <Typography>
                                {formatDate(task.createdOn)}: {task.displayName}
                            </Typography>
                            <LoadingButton
                                variant="contained"
                                onClick={() => loadDetails(task)}
                                loading={loading}
                            >
                                Open Task
                            </LoadingButton>
                        </div>
                    ))}
                    { (!loading && humanTasks.length === 0) && <Typography>No pending human tasks</Typography> }
                </Pane>
                <form onSubmit={claimAndComplete}>
                    <Pane>
                        { (loading && humanTasks.length > 0 && !templateDef) && <CircularProgress /> }
                        { templateDef && (
                            <>
                                <TaskFields />
                                <LoadingButton variant="contained" type="submit" loading={loading}>
                                    Claim and Complete
                                </LoadingButton>
                            </>
                        )}
                    </Pane>
                </form>
            </SplitPane>
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
        </Root>
    );
};
export default Approvals;
