import { Alert, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ConfigContext } from './app';
import { Link } from 'react-router-dom';

const Root = styled.form`
    display: flex;
    flex-direction: column;
    flex: 1 1 1px;
    gap: .7rem;
    align-items: flex-start;

    .MuiAlert-root { margin-bottom: 1.5rem; }
    .MuiTextField-root { width: 25rem }
`;

const rootWorkflow = 'onboarding-wizard';

const Onboarding = () => {
    const { callApi, profile } = useContext(ConfigContext);
    const [ loading, setLoading ] = useState(true);
    const [ stage, setStage ] = useState(1);
    const [ schema, setSchema ] = useState({});
    const [ currentExecutionId, setCurrentExecutionId ] = useState('');
    const [ isCompleted, setIsCompleted ] = useState(false);

    const loadInProgressTask = (execution) => {
        setCurrentExecutionId(execution.workflowId);
        const inProgressTask = execution.tasks.find((task) => task.status === 'IN_PROGRESS');
        setStage(parseInt(inProgressTask.referenceTaskName.substr(-1)));
        const nextSchemaName = inProgressTask.taskDefinition.inputSchema.name;
        callApi('get', `schema/${nextSchemaName}`, null, ({ data }) => {
            setSchema(data.properties);
            setLoading(false);
        });
    };

    useEffect(() => {
        const onSuccess = (executions) => {
            if (executions.length === 0) {
                // No existing onboarding workflow: get workflow def and get workflow input schema def
                callApi('get', `workflow-def/${rootWorkflow}`, null, (workflowDef) => {
                    const schemaName = workflowDef.inputSchema.name;
                    callApi('get', `schema/${schemaName}`, null, ({ data }) => {
                        setSchema(data.properties);
                        setLoading(false);
                    });
                });
            } else {
                // Existing onboarding workflow: get stage and task input schema def
                callApi('get', `execution/${executions[0].workflowId}`, null, loadInProgressTask);
            }
        };
        const uri = `search-executions?workflowName=${rootWorkflow}&identityCorrelation=true`;
        callApi('get', uri, null, onSuccess);
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        setLoading(true);
        if (stage === 1) {
            data.correlationId = data.email;
            callApi('post', `start/${rootWorkflow}/1`, data, (executionId) => {
                callApi('post', `signal/${executionId}`, null, (execution) => loadInProgressTask(execution));
            });
        } else {
            callApi('post', `signal/${currentExecutionId}`, data, (execution) => {
                if (execution.status !== 'COMPLETED') {
                    loadInProgressTask(execution);
                } else {
                    setIsCompleted(true);
                    setLoading(false);
                }
            });
        }
    };

    const transformLabel = (input) => input
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());

    const Completed = () => (
        <Alert severity="success">
            Onboarding completed!
        </Alert>
    );

    const Main = () => loading ? <CircularProgress /> : isCompleted ? <Completed /> : (
        <>
            <Alert severity="info">
                Stage {stage}:
                {' '}
                { stage === 1 && 'No existing workflow executions found. This submission will start an execution and signal the first yield.' }
                { stage > 1 && (<><Link target="_blank" to={`https://ys.orkesconductor.io/execution/${currentExecutionId}`}>Execution</Link> in progress. This submission will submit the data as a signal to the current yield task.</>) }
            </Alert>
            { Object.keys(schema).map((key) => (
                <TextField
                    key={key}
                    label={transformLabel(key)}
                    name={key}
                    required
                    defaultValue={profile[key] || ''}
                    slotProps={{ input: { readOnly: key === 'email' } }}
                />
            ))}
            <Button
                variant="contained"
                type="submit"
            >
                Next Step
            </Button>
        </>
    );

    return (
        <Root onSubmit={handleSubmit}>
            <Typography variant="h5" mb={2}>
                Customer Onboarding
            </Typography>
            <Main />
        </Root>
    );
};
export default Onboarding;
