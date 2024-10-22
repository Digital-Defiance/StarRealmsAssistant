import React from 'react';
import LoadSaveGame from '@/components/LoadSaveGame';
import CenteredContainer from '../CenteredContainer';
import TabTitle from '../TabTitle';

export default function LoadSaveGameScreen() {
  return (
    <CenteredContainer>
      <TabTitle>Load/Save Game</TabTitle>
      <LoadSaveGame />
    </CenteredContainer>
  );
}
