import TextField from '@mui/material/TextField';
import { FlexBox } from './shared';
import Button from '@mui/material/Button';
import styled from 'styled-components';

const ItemRow = styled(FlexBox)`
    flex-direction: row;
    flex-grow: 0;
    .MuiFormControl-root:nth-child(1) { width: 6rem }
    .MuiFormControl-root:nth-child(2) { flex: 1 1 1px }
    .MuiFormControl-root:nth-child(3) { width: 8rem }
`;

export const Invoice = ({ invoice, handleSubmit=null }) => {
    return (
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
                slotProps={{ htmlInput: { style: { textAlign: 'right' } } }}
            />
            { handleSubmit && (
                <Button
                    color="primary"
                    variant="contained"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            )}
        </FlexBox>
    );
};
