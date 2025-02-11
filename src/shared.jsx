import styled from 'styled-components';
import Typography from '@mui/material/Typography';

export const FlexBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 1px;
  gap: 1rem;
  &:empty { display: none }
  .MuiAlert-root:has(> .MuiAlert-message:empty) { display: none }
`;

export const NavBarRoot = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${props => props.color};
    padding: .5rem;
    overflow: hidden;
    flex-shrink: 0;

    .links {
        overflow: hidden;
        p, div {
            flex-shrink: 0;
            overflow: hidden;
        }
    }
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

export const NavItem = styled.div`
    color: white;
    display: flex;
    align-items: center;
    a {
        color: white !important;
        line-height: 1rem;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    &:not(:last-child)::after {
        margin: .3rem;
        content: '·';
        font-size: 2rem;
        line-height: .1rem;
    }
    &.cluster {
        @media screen and (max-width: 600px) {
            display: none
        }
    }
`;

export const ContentRoot = styled.div`
    padding: .5rem;
    height: 100%;
    display: flex;
    flex: 1 1 1px;
`;

export const BrandImage = styled.img`
    height: 2rem;
    padding-right: .3rem;
    align-self: center;
`;
