import Typography from "@mui/material/Typography";
import { ConfigContext } from "./app";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 1px;
  gap: 1rem;
`;

const SplitPane = styled.div`
    display: flex;
    flex: 1 1 1px;
`;

const Pane = styled.div`
    display: flex;
    flex: 1 1 1px;
    flex-direction: column;
    gap: 1rem;
`;

const Approvals = () => {
    const { identity, origin } = useContext(ConfigContext);
    const [ loading, setLoading ] = useState(true);
    const [ humanTasks, setHumanTasks ] = useState([]);
    const [ task, setTask ] = useState({});
    const [ templateDef, setTemplateDef ] = useState();

    const listHumanTasks = () => {
        const config = {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${identity}`,
            }
        };
        fetch(`${origin}/demo/api/human-tasks`, config)
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

    const getTaskValue = (scope) => task.input[scope.replace('#/properties/', '')];

    const TaskDetails = () => {
        const inputs = templateDef.templateUI.elements
            .filter((field) => field.options.readonly)
            .map((field) => (
                <TextField
                    key={field.label}
                    label={field.label}
                    value={getTaskValue(field.scope)}
                />
            ));
        const outputs = templateDef.templateUI.elements
            .filter((field) => !field.options.readonly)
            .map((field) => (
                <TextField
                    key={field.label}
                    label={field.label}
                    value={getTaskValue(field.scope)}
                />
            ));
        return (
            <>
                {inputs}
                {outputs}
                <Button color="info" variant="contained">Submit</Button>
            </>
        );
    };

    const loadDetails = (t) => {
        setTemplateDef(undefined);
        setLoading(true);
        setTask(t);

        const template = t.input.__humanTaskDefinition.userFormTemplate;
        const templateName = template.name;
        const templateVersion = template.version;

        const config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${identity}`,
            }
        };
        fetch(`${origin}/demo/api/human-template?name=${templateName}`, config)
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
                                {formatDate(task.createdOn)}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => loadDetails(task)}
                                disabled={loading}
                            >
                                {task.displayName}
                            </Button>
                        </div>
                    ))}
                </Pane>
                <Pane>
                    { (loading && !templateDef) && <CircularProgress /> }
                    { templateDef && <TaskDetails /> }
                </Pane>
            </SplitPane>
        </Root>
    );
};
export default Approvals;
