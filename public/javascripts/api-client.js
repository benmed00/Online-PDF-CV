/**
 * Shared fetch helper for API calls with consistent error handling.
 */
(function (global) {
  class NetworkError extends Error {
    constructor(message = 'Could not reach server — check your connection and try again.') {
      super(message);
      this.name = 'NetworkError';
    }
  }

  class ApiError extends Error {
    constructor(message, statusCode, validation) {
      super(message);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.validation = validation;
    }
  }

  async function parseApiResponse(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  async function fetchApi(url, options = {}) {
    let response;
    try {
      response = await fetch(url, options);
    } catch {
      throw new NetworkError();
    }

    const data = await parseApiResponse(response);
    if (response.ok) return data;

    const message = data.error || data.message || 'Request failed';
    throw new ApiError(message, response.status, data.validation);
  }

  global.ApiClient = { fetchApi, NetworkError, ApiError, parseApiResponse };
})(typeof window !== 'undefined' ? window : self);
