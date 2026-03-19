// Types para tratamento de erros
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

export interface ErrorNotification {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
  duration?: number;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
