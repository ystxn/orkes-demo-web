import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { DropzoneArea } from 'mui-file-dropzone';
import { useContext, useState } from 'react';
import { ConfigContext } from './app';
import { FlexBox } from './shared';
import { Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { Invoice } from './invoice';

const InvoiceClaims = () => {
    const { callApi, profile } = useContext(ConfigContext);
    const [ loading, setLoading ] = useState(false);
    const [ invoice, setInvoice ] = useState(null);
    const [ error, setError ] = useState(null);
    const [ executionId, setExecutionId ] = useState(null);

    const onError = () => setError('Your invoice could not be processed');

    const handleInferImage = async (files) => {
        if (files.length === 0) {
            return;
        }
        const formData = new FormData();
        formData.append('file', files[0]);
        callApi('post', 'infer-image', formData, (response) => setInvoice(response), onError, setLoading);
    };

    const handleSubmit = () => {
        const data = { ...invoice, correlationId: profile.email }
        callApi('post', 'start/invoice-claim/1', data, (id) => setExecutionId(id), null, setLoading);
    };

    return (
        <FlexBox>
            <Typography variant="h5" mb={2}>
                Invoice Claims
            </Typography>
            { loading && <CircularProgress size="5rem" /> }
            { (!invoice && !loading) && (
                <>
                    <Typography>
                        Upload your invoice below for submission:
                    </Typography>
                    <DropzoneArea
                        onChange={handleInferImage}
                        acceptedFiles={[ 'application/pdf', 'image/jpeg', 'image/png' ]}
                        filesLimit={1}
                    />
                    <Alert severity="error">{error}</Alert>
                </>
            )}
            { (invoice && !loading && !executionId) && <Invoice invoice={invoice} handleSubmit={handleSubmit} />}
            { executionId && (
                <Alert severity="success">
                    Your invoice has been successfully submitted. (
                    <Link target="_blank" to={`https://ys.orkesconductor.io/execution/${executionId}`}>
                        View Execution
                    </Link>
                    )
                </Alert>
            )}
        </FlexBox>
    );
};
export default InvoiceClaims;
