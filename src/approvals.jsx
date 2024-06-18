import Typography from "@mui/material/Typography";
import { ConfigContext } from "./app";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 1px;
  gap: 1rem;
`;

const Approvals = () => {
    const { identity, origin } = useContext(ConfigContext);
    const [ loading, setLoading ] = useState(true);
    const [ humanTasks, setHumanTasks ] = useState([]);

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

    return (
        <Root>
            <Typography variant="h5">
                Approvals
            </Typography>

            { humanTasks.map((task) => (
                <div key={task.taskId}>{task.displayName}</div>
            ))}
        </Root>
    );
};
export default Approvals;
