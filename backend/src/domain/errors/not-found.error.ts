export class NotFoundError extends Error {
  constructor(entity: string, id: number | string) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}
