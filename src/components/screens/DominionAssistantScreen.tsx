import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate, useLocation } from 'react-router-dom';
import DominionAssistant from '@/components/DominionAssistant';
import SuperCapsText from '@/components/SuperCapsText';

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  height: '100vh',
}));

export default function DominionAssistantScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledContainer>
      <SuperCapsText fontSize={24}>Unofficial Dominion Assistant</SuperCapsText>
      <DominionAssistant route={location} navigation={navigate} />
    </StyledContainer>
  );
}
