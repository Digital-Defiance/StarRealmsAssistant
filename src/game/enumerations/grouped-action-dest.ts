export enum GroupedActionDest {
  CurrentPlayerIndex = 'currentPlayerIndex',
  SelectedPlayerIndex = 'selectedPlayerIndex',
  AllPlayers = 'allPlayers',
  AllPlayersExceptCurrent = 'allPlayersExceptCurrent',
  AllPlayersExceptSelected = 'allPlayersExceptSelected',
}

export const GroupedActionDestStrings: Record<GroupedActionDest, string> = {
  [GroupedActionDest.CurrentPlayerIndex]: 'Current Player',
  [GroupedActionDest.SelectedPlayerIndex]: 'Selected Player',
  [GroupedActionDest.AllPlayers]: 'All Players',
  [GroupedActionDest.AllPlayersExceptCurrent]: 'All Players Except Current',
  [GroupedActionDest.AllPlayersExceptSelected]: 'All Players Except Selected',
};
