import React from 'react';
import GameLog from '@/components/GameLog';
import ScrollableContainer from '@/components/ScrollableContainer';

export default function GameLogScreen() {
  return (
    <ScrollableContainer>
      <GameLog />
    </ScrollableContainer>
  );
}
