import { useUserStore } from '../UserStore';

export const getAuthToken = (): string => {
  const userStore = useUserStore.getState();
  if (!userStore.isAuthenticated || !userStore.tokens?.accessToken) {
    throw new Error('Please log in to continue');
  }
  return userStore.tokens.accessToken;
};

export const handleApiError = async (error: any, context: string) => {
  let errorMessage: string;
  let shouldLogout = false;

  // Handle errors from the service layer
  if (
    error.code === 'SESSION_NOT_FOUND' ||
    error.code === 'MESSAGE_NOT_FOUND'
  ) {
    errorMessage = error.message;
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    errorMessage = error.message;
  } else if (
    error.code === 'INVALID_SESSION_DATA' ||
    error.code === 'INVALID_MESSAGE_DATA'
  ) {
    errorMessage = error.message;
  } else if (
    error.details?.status === 401 ||
    error.message?.includes('unauthorized')
  ) {
    shouldLogout = true;
    errorMessage = 'Your session has expired. Please log in again.';
  } else {
    errorMessage = error.message || `Failed to ${context}`;
  }

  // Show error toast
  const { useToastStore } = await import('../ToastStore');
  useToastStore.getState().error(errorMessage, {
    title: `${context.charAt(0).toUpperCase() + context.slice(1)} Failed`,
  });

  // Handle authentication errors
  if (shouldLogout) {
    const userStore = useUserStore.getState();
    await userStore.logout();
  }

  return errorMessage;
};
