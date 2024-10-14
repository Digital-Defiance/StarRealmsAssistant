import React from 'react';
import { Box, Typography, List, ListItem, styled } from '@mui/material';
import SuperCapsText from '@/components/SuperCapsText';
import { useGameContext } from '@/components/GameContext';
import { IBaseKingdom } from '@/game/interfaces/set-kingdom/base';
import { IProsperityKingdom } from '@/game/interfaces/set-kingdom/prosperity';

const Container = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  maxWidth: 600,
  margin: '0 auto',
}));

const Header = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
}));

const StyledListItem = styled(ListItem)({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: 8,
  paddingBottom: 8,
});

const CardName = styled(Typography)({
  fontSize: 16,
});

const Quantity = styled(Typography)({
  fontSize: 16,
  fontWeight: 'bold',
});

const Note = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2),
}));

const SupplyCounts: React.FC = () => {
  const { gameState } = useGameContext();

  const supplyCards: (keyof IBaseKingdom | keyof IProsperityKingdom)[] = [
    'estates',
    'duchies',
    'provinces',
    'coppers',
    'silvers',
    'golds',
    'curses',
    'colonies',
    'platinums',
  ];

  const getSetInfo = () => {
    const playerCount = gameState.players.length;
    if (playerCount <= 2) return '1 set (2 players)';
    if (playerCount <= 4) return '1 set (3-4 players)';
    return '2 sets (5-6 players)';
  };

  return (
    <Container>
      <Header>
        <SuperCapsText fontSize={28}>Kingdom Supply</SuperCapsText>
        <Subtitle>{getSetInfo()}</Subtitle>
      </Header>
      <List>
        {supplyCards.map((item) => {
          const quantity = gameState.supply[item] ?? 0;
          if (quantity === -1) return null;
          const cardName = item.charAt(0).toUpperCase() + item.slice(1);

          return (
            <StyledListItem key={item}>
              <CardName>{cardName}</CardName>
              <Quantity>{quantity}</Quantity>
            </StyledListItem>
          );
        })}
      </List>
      <Note>Note: Supply counts include trashed cards.</Note>
    </Container>
  );
};

export default SupplyCounts;
