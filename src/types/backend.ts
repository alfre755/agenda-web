/**
 * @typedef {Object} ObjectId
 */
export type ObjectId = string;

/**
 * @typedef {Object} BackendRequest
 * @property {(data?: unknown) => Promise<BackendResponse>} request
 */
export interface BackendRequest {
  (data?: unknown): Promise<BackendResponse>;
}

/**
 * @typedef {Object} BackendResponse
 * @property {boolean} success
 * @property {number} status
 * @property {string} message
 * @property {unknown} data
 */
export interface BackendResponse {
  success: boolean;
  status: number;
  message: string;
  data?: unknown;
}

/**
 * @typedef {Object} BackendRequestConfig
 * @property {AbortController} abortController
 * @property {string} contentType
 */
export interface BackendRequestConfig {
  abortController?: AbortController;
  contentType?: string;
}

/**
 * @typedef {Object} BackendRequestsLibrary
 */
export interface BackendRequestsLibrary {
  // Appointments
  appointments: {
    listar: BackendRequest;
    crear: BackendRequest;
    modificar: BackendRequest;
    obtener: BackendRequest;
    eliminar: BackendRequest;
  };
  
  // Clients
  clients: {
    listar: BackendRequest;
    crear: BackendRequest;
    modificar: BackendRequest;
    obtener: BackendRequest;
    eliminar: BackendRequest;
  };
  
  // Calendars
  calendars: {
    listar: BackendRequest;
    crear: BackendRequest;
    modificar: BackendRequest;
    obtener: BackendRequest;
    eliminar: BackendRequest;
  };
  
  // Organizations
  organizations: {
    listar: BackendRequest;
    crear: BackendRequest;
    modificar: BackendRequest;
    obtener: BackendRequest;
    eliminar: BackendRequest;
  };
}

export type BackendContextObject = BackendRequestsLibrary;
