import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../stores/UserStore';

export const useOAuthHandler = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { handleOAuthSuccess } = useUserStore();

  useEffect(() => {
    const processOAuthCallback = async () => {
      const token = searchParams.get('token');
      const oauthStatus = searchParams.get('oauth');

      // Early return if no OAuth parameters
      if (oauthStatus !== 'success' || !token) {
        return;
      }

      try {
        // Use the existing store method to handle OAuth success
        await handleOAuthSuccess(token);

        // Clean up URL parameters for security
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('token');
        newParams.delete('oauth');
        setSearchParams(newParams, { replace: true });

        // Navigate to dashboard after successful authentication
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('OAuth authentication failed:', error);

        // Clean up URL parameters even on error
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('token');
        newParams.delete('oauth');
        setSearchParams(newParams, { replace: true });

        // Redirect to auth page on authentication failure
        navigate('/auth', { replace: true });
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate, handleOAuthSuccess, setSearchParams]);
};
