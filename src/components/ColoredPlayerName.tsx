import { IPlayer } from '@/game/interfaces/player';
import { Typography } from '@mui/material';
import React, { CSSProperties, FC } from 'react';

interface ColoredPlayerNameProps {
  player: IPlayer;
  marginDirection?: 'left' | 'right';
  style?: CSSProperties;
}

const ColoredPlayerName: FC<ColoredPlayerNameProps> = ({
  player,
  marginDirection = 'right',
  style,
}) => {
  return (
    <Typography
      component="span"
      sx={{
        ...style,
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
