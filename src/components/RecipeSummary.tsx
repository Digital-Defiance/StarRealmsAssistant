import React, { FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from '@mui/material';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import {
  GroupedActionDest,
  GroupedActionDestStrings,
} from '@/game/enumerations/grouped-action-dest';
import {
  GroupedActionTrigger,
  GroupedActionTriggerStrings,
} from '@/game/enumerations/grouped-action-trigger';
import { actionToString } from '@/game/dominion-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IRecipeAction } from '@/game/interfaces/recipe-action';

interface RecipeSummaryProps {
  recipe: IGroupedAction;
}

export const RecipeSummary: FC<RecipeSummaryProps> = ({ recipe }) => {
  const renderActionTable = (actions: Record<GroupedActionDest, Array<Partial<IRecipeAction>>>) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Destination</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(actions).map(([dest, actionList]) =>
            actionList.map((action, index) => (
              <TableRow key={`${dest}-${index}`}>
                <TableCell>{GroupedActionDestStrings[dest as GroupedActionDest]}</TableCell>
                <TableCell>
                  {actionToString(
                    action.action ?? GameLogAction.GROUPED_ACTION,
                    action.count,
                    true
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box p={2} maxWidth={400}>
      <Typography variant="h6" gutterBottom>
        {recipe.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Immediate Actions:
      </Typography>
      {renderActionTable(recipe.actions)}
      {recipe.triggers && (
        <>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Future Actions:
          </Typography>
          {Object.entries(recipe.triggers).map(([trigger, actions]) => (
            <Box key={trigger} mt={1}>
              <Typography variant="subtitle2">
                {GroupedActionTriggerStrings[trigger as GroupedActionTrigger]}:
              </Typography>
              {renderActionTable(actions)}
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};
