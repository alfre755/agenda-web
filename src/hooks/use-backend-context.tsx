"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";

// import { useAuth } from "@/hooks/use-auth";
import type { 
  BackendContextObject, 
  BackendRequestConfig, 
  BackendRequestsLibrary, 
  BackendResponse} from "@/types/backend";

const _defaultRequestConfig: BackendRequestConfig = {
  abortController: undefined,
  contentType: undefined,
};

/**
 * @typedef {Object} BackendContextObject
 */
const BackendContext = createContext<BackendContextObject | null>(null);

/**
 * Hook que permite enviar requests al backend
 * @return {BackendContextObject}
 */
export function useBackend(): BackendContextObject {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error("useBackend must be used within a BackendProvider");
  }
  return context;
}

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// API endpoints constants
const APPOINTMENTS_ENDPOINT = "/api/appointments";
const CLIENTS_ENDPOINT = "/api/clients";
const CALENDARS_ENDPOINT = "/api/calendars";
const ORGANIZATIONS_ENDPOINT = "/api/organizations";
const CALENDAR_CONFIG_ENDPOINT = "/api/calendar-config";

interface BackendProviderProps {
  children: React.ReactNode;
}

export default function BackendProvider({ children }: BackendProviderProps) {
  // const { session } = useAuth();

  const _handleError = useCallback(
    /**
     * Método privado que gestiona el error como resultado de una solicitud
     * @param {Error} errorData Contenido del error
     * @returns {BackendResponse}
     */
    (errorData: Error): BackendResponse => {
      console.error("Backend error:", errorData);
      return { 
        success: false, 
        status: 500, 
        message: "Ha ocurrido un error inesperado",
        data: null 
      };
    },
    []
  );

  const _handlerRequest = useCallback(
    /**
     * Método privado que gestiona las request al backend
     * @async
     * @param {String} url URL de la solicitud
     * @param {RequestInit} requestOptions Opciones de la solicitud
     * @returns {Promise<BackendResponse>}
     */
    async (url: string, requestOptions: RequestInit = {}): Promise<BackendResponse> => {
      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(requestOptions.headers || {}),
        };

        // TODO: Agregar autenticación cuando esté disponible
        // if (session?.token) {
        //   headers.Authorization = `Bearer ${session.token}`;
        // }

        const response = await fetch(`${API_URL}${url}`, {
          ...requestOptions,
          headers,
        });

        if (!response.ok) {
          const errorMessage = `HTTP error! status: ${response.status}`;
          return {
            success: false,
            status: response.status,
            message: errorMessage,
            data: null
          };
        }

        const data = await response.json();
        return {
          success: true,
          status: response.status,
          message: "Request successful",
          data: data.data !== undefined ? data.data : data
        };
      } catch (error) {
        return _handleError(error as Error);
      }
    },
    [_handleError]
  );

  const _createEventRequest = useCallback(
    /**
     * Método privado para crear una solicitud al backend
     * @param {String} url URL correspondiente a la solicitud
     * @param {String} method Método HTTP
     * @returns {Function} retorna la función declarada para ser utilizada
     */
    (url: string, method: string = "GET") => {
      return async (data?: unknown): Promise<BackendResponse> => {
        try {
          const requestOptions: RequestInit = { method };
          
          if (data && (method === "POST" || method === "PUT")) {
            requestOptions.body = JSON.stringify(data);
          }
          
          return await _handlerRequest(url, requestOptions);
        } catch (error) {
          return _handleError(error as Error);
        }
      };
    },
    [_handleError, _handlerRequest]
  );


  // Biblioteca de requests estructurada
  const requestsLibrary: BackendRequestsLibrary = useMemo(
    () => ({
      appointments: {
        listar: _createEventRequest(APPOINTMENTS_ENDPOINT, "GET"),
        crear: _createEventRequest(APPOINTMENTS_ENDPOINT, "POST"),
        modificar: _createEventRequest(APPOINTMENTS_ENDPOINT, "PUT"),
        obtener: _createEventRequest(APPOINTMENTS_ENDPOINT, "GET"),
        eliminar: _createEventRequest(APPOINTMENTS_ENDPOINT, "DELETE"),
      },
      clients: {
        listar: _createEventRequest(CLIENTS_ENDPOINT, "GET"),
        crear: _createEventRequest(CLIENTS_ENDPOINT, "POST"),
        modificar: _createEventRequest(CLIENTS_ENDPOINT, "PUT"),
        obtener: _createEventRequest(CLIENTS_ENDPOINT, "GET"),
        eliminar: _createEventRequest(CLIENTS_ENDPOINT, "DELETE"),
      },
      calendars: {
        listar: _createEventRequest(CALENDARS_ENDPOINT, "GET"),
        crear: _createEventRequest(CALENDARS_ENDPOINT, "POST"),
        modificar: _createEventRequest(CALENDARS_ENDPOINT, "PUT"),
        obtener: _createEventRequest(CALENDARS_ENDPOINT, "GET"),
        eliminar: _createEventRequest(CALENDARS_ENDPOINT, "DELETE"),
      },
      organizations: {
        listar: _createEventRequest(ORGANIZATIONS_ENDPOINT, "GET"),
        crear: _createEventRequest(ORGANIZATIONS_ENDPOINT, "POST"),
        modificar: _createEventRequest(ORGANIZATIONS_ENDPOINT, "PUT"),
        obtener: _createEventRequest(ORGANIZATIONS_ENDPOINT, "GET"),
        eliminar: _createEventRequest(ORGANIZATIONS_ENDPOINT, "DELETE"),
      },
      calendarConfig: {
        listar: _createEventRequest(CALENDAR_CONFIG_ENDPOINT, "GET"),
        crear: _createEventRequest(CALENDAR_CONFIG_ENDPOINT, "POST"),
        modificar: _createEventRequest(CALENDAR_CONFIG_ENDPOINT, "PUT"),
        obtener: _createEventRequest(CALENDAR_CONFIG_ENDPOINT, "GET"),
        eliminar: _createEventRequest(CALENDAR_CONFIG_ENDPOINT, "DELETE"),
      },
    }),
    [_createEventRequest]
  );


  const contextData: BackendContextObject = useMemo(
    () => ({
      // Biblioteca estructurada
      ...requestsLibrary,
    }),
    [requestsLibrary]
  );

  return (
    <BackendContext.Provider value={contextData}>
      {children}
    </BackendContext.Provider>
  );
}