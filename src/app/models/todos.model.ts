export type Status = 'pending' | 'completed';

export interface TodoInsertBody {
  name: string;
  priority: number;
  status: Status;
}

export interface Todo extends TodoInsertBody {
  id: string;
  userId: string;
}
