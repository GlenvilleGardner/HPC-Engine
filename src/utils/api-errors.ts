export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export class ApiValidationError extends Error {
  code: string;

  constructor(message: string, code = "VALIDATION_ERROR") {
    super(message);
    this.name = "ApiValidationError";
    this.code = code;
  }
}

export function toApiErrorResponse(error: unknown): ApiErrorResponse {
  if (error instanceof ApiValidationError) {
    return {
      error: {
        code: error.code,
        message: error.message
      }
    };
  }

  if (error instanceof Error) {
    return {
      error: {
        code: "INTERNAL_ERROR",
        message: error.message
      }
    };
  }

  return {
    error: {
      code: "UNKNOWN_ERROR",
      message: "Unknown error"
    }
  };
}
