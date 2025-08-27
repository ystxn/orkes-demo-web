import { Alert, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ConfigContext } from './context';
import { Link } from 'react-router-dom';
import { FlexBox } from './shared';

const Root = styled(FlexBox)`
    gap: .7rem;
    align-items: flex-start;
    .MuiAlert-root + .MuiTextField-root { margin-top: 1.5rem; }
    .MuiTextField-root { width: 25rem }
`;

const FlexAlert = styled(Alert)`
    .MuiAlert-message {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
`;

const rootWorkflow = 'onboarding-wizard';

const Onboarding = () => {
    const { callApi, profile, clusterUrl } = useContext(ConfigContext);
    const [ loading, setLoading ] = useState(true);
    const [ stage, setStage ] = useState(1);
    const [ schema, setSchema ] = useState({});
    const [ currentExecutionId, setCurrentExecutionId ] = useState('');
    const [ completedPayload, setCompletedPayload ] = useState(null);
    const [ error, setError ] = useState('');

    const loadInProgressTask = (execution) => {
        setCurrentExecutionId(execution.workflowId);
        const inProgressYield = execution.tasks.find((task) => task.status === 'IN_PROGRESS' && task.taskType === 'YIELD');
        const currentStage = inProgressYield.inputData.stage;
        setStage(currentStage);

        if (!inProgressYield.inputData.isValidated) {
            const reason = inProgressYield.inputData.message;
            setError(reason);
            if (currentStage === 1) {
                callApi('delete', `terminate/${execution.workflowId}?reason=${reason}`, null, () => setLoading(false));
                return;
            }
        }
        const nextSchemaName = inProgressYield.taskDefinition.inputSchema.name;
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
        const uri = `search-executions?workflowName=${rootWorkflow}&status=RUNNING&identityCorrelation=true`;
        callApi('get', uri, null, onSuccess);
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        setError('');
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        setLoading(true);
        if (stage === 1) {
            data.correlationId = data.email;
            callApi('post', `execute/${rootWorkflow}/1`, data, (execution) => loadInProgressTask(execution));
        } else {
            callApi('post', `signal/${currentExecutionId}`, data, (execution) => {
                if (execution.status !== 'COMPLETED') {
                    loadInProgressTask(execution);
                } else {
                    setCompletedPayload(execution.output.result);
                    setLoading(false);
                }
            });
        }
    };

    const transformLabel = (input) => input
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());

    const Completed = () => (
        <FlexAlert severity="success">
            Onboarding completed!
            { Object.keys(completedPayload).map((key) => (
                <TextField
                    key={key}
                    label={transformLabel(key)}
                    name={key}
                    value={completedPayload[key]}
                />
            )) }
        </FlexAlert>
    );

    const Main = () => loading ? <CircularProgress /> : completedPayload ? <Completed /> : (
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <Alert severity="info">
                Stage {stage}:
                {' '}
                { stage === 1 && 'No existing workflow executions found. This submission will start an execution with email as correlation ID.' }
                { stage > 1 && (<><Link target="_blank" to={`${clusterUrl}/execution/${currentExecutionId}`}>Execution</Link> in progress. This submission will submit the data as a signal to the current yield task.</>) }
            </Alert>
            { (stage < 3) && (
                <Alert severity="warning">
                    { stage === 1 && 'If First Name is john, validation will fail' }
                    { stage === 2 && 'If Employees is 10 and below, validation will fail' }
                </Alert>
            )}
            { error && (
                <Alert severity="error">
                    { error }
                </Alert>
            )}
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
        </form>
    );

    return (
        <>
            <Typography variant="h5" mb={2}>
                Customer Onboarding
            </Typography>
            <Main />
        </>
    );
};
export default Onboarding;
