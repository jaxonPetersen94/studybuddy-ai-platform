export interface ProxyRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  service: string;
  path: string;
  data?: any;
  query?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface ProxyResponse {
  status: number;
  data: any;
  headers?: Record<string, string>;
}

export interface ServiceHealthCheck {
  [serviceName: string]: {
    status: 'healthy' | 'unhealthy';
    url: string;
    responseTime?: string;
    error?: string;
  };
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

export class ProxyError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, data: any, message?: string) {
    super(message || 'Proxy request failed');
    this.name = 'ProxyError';
    this.status = status;
    this.data = data;
  }
}

export class ServiceUnavailableError extends Error {
  public status: number = 503;
  public service: string;

  constructor(service: string) {
    super(`Service ${service} is unavailable`);
    this.name = 'ServiceUnavailableError';
    this.service = service;
  }
}
