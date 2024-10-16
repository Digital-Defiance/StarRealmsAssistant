import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DominionAssistant from '@/components/DominionAssistant';

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  height: '100vh',
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'CharlemagneStdBold',
  marginBottom: theme.spacing(2),
}));

export default function DominionAssistantScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledContainer>
      <StyledTitle variant="h4">Unofficial Dominion Assistant</StyledTitle>
      <DominionAssistant route={location} navigation={navigate} />
    </StyledContainer>
  );
}
