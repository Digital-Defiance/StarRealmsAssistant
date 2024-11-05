import React, { FC } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  styled,
} from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import {
  getPlayerForTurn,
  getTurnAdjustments,
  groupTurnAdjustments,
} from '@/game/dominion-lib-log';
import ColoredPlayerName from '@/components/ColoredPlayerName';
import SuperCapsText from '@/components/SuperCapsText';
import SecondarySubtitle from '@/components/SecondarySubtitle';
import theme from '@/components/theme';

interface TurnAdjustmentProps {
  turn?: number;
}

const FieldName = styled(Typography)({
  fontFamily: 'Minion Pro Medium Cond Subhead',
});

const Header = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const Quantity = styled(Typography)({
  fontFamily: 'TrajanProBold',
  fontWeight: 'bold',
  fontSize: '1.5rem',
});

const TurnAdjustmentsSummary: FC<TurnAdjustmentProps> = ({ turn }) => {
  const { gameState } = useGameContext();
  const adjustments = groupTurnAdjustments(getTurnAdjustments(gameState, turn));
  const gameTurn = turn ?? gameState.currentTurn;

  return (
    <Container>
      <Header>
        <SuperCapsText className={`typography-large-title`}>Turn Adjustments</SuperCapsText>
        <SecondarySubtitle sx={{ marginTop: theme.spacing(1) }}>
          Turn: {gameTurn}{' '}
          <ColoredPlayerName
            marginDirection="left"
            player={getPlayerForTurn(gameState, gameTurn)}
          />
        </SecondarySubtitle>
      </Header>
      {adjustments.length === 0 && (
        <Typography variant="h6" align="center">
          No adjustments made this turn.
        </Typography>
      )}
      {adjustments.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Field</TableCell>
                <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Subfield</TableCell>
                <TableCell align="right" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  Increment
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adjustments.map((adjustment, index) => {
                if (adjustment.field === null || adjustment.subfield === null) {
                  return null;
                }
                const fieldName =
                  adjustment.field.charAt(0).toUpperCase() + adjustment.field.slice(1);
                const subfieldName =
                  adjustment.subfield.charAt(0).toUpperCase() + adjustment.subfield.slice(1);

                return (
                  <TableRow key={index}>
                    <TableCell sx={{ fontSize: '1.2rem' }}>
                      <FieldName className="typography-title">{fieldName}</FieldName>
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.2rem' }}>
                      <FieldName className="typography-title">{subfieldName}</FieldName>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: adjustment.increment > 0 ? 'green' : 'red' }}
                    >
                      <Quantity>
                        {adjustment.increment > 0
                          ? `+${adjustment.increment}`
                          : adjustment.increment}
                      </Quantity>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default TurnAdjustmentsSummary;
