import { ILogEntry } from '@/game/interfaces/log-entry';
import { GroupedActionDest } from '@/game/enumerations/grouped-action-dest';
import { GroupedActionTrigger } from '@/game/enumerations/grouped-action-trigger';

export interface IGroupedAction {
  name: string;
  actions: Record<GroupedActionDest, Array<Partial<ILogEntry>>>;
  triggers?: Record<GroupedActionTrigger, Record<GroupedActionDest, Array<Partial<ILogEntry>>>>;
}
