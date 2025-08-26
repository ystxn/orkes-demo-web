import DownloadIcon from '@mui/icons-material/Download';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Avatar, IconButton, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import { DropzoneArea } from 'mui-file-dropzone';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfigContext } from './context';
import { Invoice } from './invoice';
import { FlexBox } from './shared';

const DownloadButton = ({ file }) => (
    <IconButton component="a" href={file} download>
        <DownloadIcon />
    </IconButton>
);

const SampleInvoiceItem = ({ label, file }) => (
    <ListItem secondaryAction={<DownloadButton file={file} />}>
        <ListItemAvatar>
            <Avatar>
                <ReceiptIcon />
            </Avatar>
        </ListItemAvatar>
        <ListItemText primary={label} />
    </ListItem>
);

const InvoiceClaims = () => {
    const { callApi, profile, clusterUrl } = useContext(ConfigContext);
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
        <>
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
                    <Link target="_blank" to={`${clusterUrl}/execution/${executionId}`}>
                        View Execution
                    </Link>
                    )
                </Alert>
            )}
            <FlexBox width={15}>
                <Typography variant="h6">Sample Invoices</Typography>
                <List dense>
                    <SampleInvoiceItem label="Small Invoice" file="invoice-small.pdf" />
                    <SampleInvoiceItem label="Large Invoice" file="invoice-large.pdf" />
                </List>
            </FlexBox>
        </>
    );
};
export default InvoiceClaims;
