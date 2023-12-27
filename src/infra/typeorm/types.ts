type NotNull = {
  type: 'not null',
  table: string,
  column: string,
}

type Unique = {
  type: 'unique',
  table: string,
  column: string,
}

export type TypeormExeptions = NotNull | Unique;
