type AgentApiErrorShape = {
  message?: string;
  data?: {
    error?: {
      code?: string;
      message?: string;
    };
  };
};

export function getAgentApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const apiErr = error as AgentApiErrorShape;
    if (apiErr.data?.error?.message) return apiErr.data.error.message;
    if (apiErr.message) return apiErr.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

