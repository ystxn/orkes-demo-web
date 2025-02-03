import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { DropzoneArea } from 'mui-file-dropzone';
import { useContext, useState } from 'react';
import { ConfigContext } from './app';
import { FlexBox } from './shared';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import styled from 'styled-components';
import { Alert } from '@mui/material';

const ItemRow = styled(FlexBox)`
    flex-direction: row;
    flex-grow: 0;
    .MuiFormControl-root:nth-child(1) { width: 6rem }
    .MuiFormControl-root:nth-child(2) { flex: 1 1 1px }
    .MuiFormControl-root:nth-child(3) { width: 8rem }
`;

const InvoiceClaims = () => {
    const { callApi } = useContext(ConfigContext);
    const [ loading, setLoading ] = useState(false);
    const [ invoice, setInvoice ] = useState(null);
    const [ error, setError ] = useState(null);

    const onError = () => setError('Your invoice could not be processed');

    const handleChange = async (files) => {
        if (files.length === 0) {
            return;
        }
        const formData = new FormData();
        formData.append('file', files[0]);
        callApi('post', 'infer-image', formData, (response) => setInvoice(response), onError, setLoading);
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
                        onChange={handleChange}
                        acceptedFiles={[ 'application/pdf', 'image/jpeg', 'image/png' ]}
                        filesLimit={1}
                    />
                    <Alert severity="error">{error}</Alert>
                </>
            )}
            { (invoice && !loading) && (
                <FlexBox>
                    <TextField
                        label="Invoice Number"
                        defaultValue={invoice?.invoiceNumber}
                        required
                    />
                    <TextField
                        label="Vendor"
                        defaultValue={invoice?.vendor}
                        required
                    />
                    <TextField
                        label="Date"
                        defaultValue={invoice?.date}
                        required
                        type="date"
                    />
                    { invoice?.items.map((item, index) => (
                        <ItemRow key={index}>
                            <TextField
                                label="Quantity"
                                defaultValue={item?.quantity}
                                required
                                type="number"
                            />
                            <TextField
                                label="Description"
                                defaultValue={item?.description}
                                required
                            />
                            <TextField
                                label="Unit Price"
                                defaultValue={item?.unitPrice}
                                required
                                type="number"
                            />
                        </ItemRow>
                    ))}
                    <TextField
                        label="Total"
                        defaultValue={invoice?.total}
                        required
                        type="number"
                    />
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => alert('WIP')}
                    >
                        Submit
                    </Button>
                </FlexBox>
            )}
        </FlexBox>
    );
};
export default InvoiceClaims;
