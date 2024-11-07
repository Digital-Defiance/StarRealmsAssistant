import { ReactElement } from 'react';
import { IGroupedAction } from '@/game/interfaces/grouped-action';

export interface RecipeSection {
  title: string;
  icon?: ReactElement;
  recipes: Record<string, IGroupedAction>;
}
