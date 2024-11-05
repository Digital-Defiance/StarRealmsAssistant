import { IPlayer } from '@/game/interfaces/player';
import { Typography } from '@mui/material';
import React, { FC } from 'react';

interface ColoredPlayerNameProps {
  player: IPlayer;
  marginDirection?: 'left' | 'right';
}

const ColoredPlayerName: FC<ColoredPlayerNameProps> = ({ player, marginDirection = 'right' }) => {
  return (
    <Typography
      component="span"
      sx={{
        color: player.color,
        fontWeight: 'bold',
        marginRight: marginDirection === 'right' ? '4px' : '0',
        marginLeft: marginDirection === 'left' ? '4px' : '0',
      }}
    >
      &lt;{player.name}&gt;
    </Typography>
  );
};

export default ColoredPlayerName;
