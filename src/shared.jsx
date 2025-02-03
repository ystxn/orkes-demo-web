import styled from 'styled-components';

export const FlexBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 1px;
  gap: 1rem;
  &:empty { display: none }
`;
