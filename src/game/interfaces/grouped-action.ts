import { IRecipeAction } from '@/game/interfaces/recipe-action';
import { GroupedActionDest } from '@/game/enumerations/grouped-action-dest';
import { GroupedActionTrigger } from '@/game/enumerations/grouped-action-trigger';
import { ReactElement } from 'react';

export interface IGroupedAction {
  name: string;
  icon?: ReactElement;
  actions: Record<GroupedActionDest, Array<Partial<IRecipeAction>>>;
  triggers?: Record<GroupedActionTrigger, Record<GroupedActionDest, Array<Partial<IRecipeAction>>>>;
}
