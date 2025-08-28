import styled from 'styled-components';
import Typography from '@mui/material/Typography';

export const FlexBox = styled.div<{ width?: number }>`
  display: flex;
  flex-direction: column;
  flex: 1 1 1px;
  gap: 1rem;
  width: ${props => props.width ? props.width + 'rem' : 'auto'};
`;

export const Brand = styled(Typography)`
    text-transform: uppercase;
    color: white;
    padding-right: 1.5rem;
    align-self: center;
    white-space: nowrap;
    @media screen and (max-width: 600px) {
        display: none
    }
`;

export const BrandImage = styled.img`
    height: 2rem;
    padding-right: .3rem;
    align-self: center;
`;

export const ContentRoot = styled.div`
    margin-top: 4rem;
    padding: 1rem;
    height: 100%;
    display: flex;
    flex: 1 1 1px;
    flex-direction: column;
    gap: .5rem;

    &:empty { display: none }
    .MuiAlert-root:has(> .MuiAlert-message:empty) { display: none }
`;

export const buildImageUrl = (unsplashId) =>
    `https://images.unsplash.com/photo-${unsplashId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`;

export const formatDate = (date) => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatter = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: userTimeZone
    });
    return formatter.format(new Date(date)).replace(",", "");
};
