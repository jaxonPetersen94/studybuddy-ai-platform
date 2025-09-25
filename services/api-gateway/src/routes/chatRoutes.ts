import express, { Request, Response } from 'express';

const router = express.Router();
const CHAT_SERVICE_URL = `${process.env.CHAT_SERVICE_BASE_URL}/api/v1/chats`;

async function forwardRequest(
  req: Request,
  res: Response,
  path: string,
  method: string,
) {
  try {
    const response = await fetch(`${CHAT_SERVICE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization
          ? { Authorization: req.headers.authorization }
          : {}),
      },
      body:
        method !== 'GET' && method !== 'DELETE'
          ? JSON.stringify(req.body)
          : null,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`Error forwarding request to chat service: ${error}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Failed to communicate with Chat Service',
    });
  }
}

async function forwardStreamRequest(req: Request, res: Response, path: string) {
  try {
    const response = await fetch(`${CHAT_SERVICE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization
          ? { Authorization: req.headers.authorization }
          : {}),
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Pipe the stream response
    response.body?.pipeTo(
      new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
        abort(err) {
          console.error('Stream aborted:', err);
          res.end();
        },
      }),
    );
  } catch (error) {
    console.error(`Error forwarding stream request to chat service: ${error}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Failed to communicate with Chat Service',
    });
  }
}

/**
 * Session Management Routes
 */
router.get('/sessions', (req, res) =>
  forwardRequest(req, res, '/sessions', 'GET'),
);
router.post('/sessions', (req, res) =>
  forwardRequest(req, res, '/sessions', 'POST'),
);
router.get('/sessions/:sessionId', (req, res) =>
  forwardRequest(req, res, `/sessions/${req.params.sessionId}`, 'GET'),
);
router.put('/sessions/:sessionId', (req, res) =>
  forwardRequest(req, res, `/sessions/${req.params.sessionId}`, 'PUT'),
);
router.delete('/sessions/:sessionId', (req, res) =>
  forwardRequest(req, res, `/sessions/${req.params.sessionId}`, 'DELETE'),
);

/**
 * Message Management Routes
 */
router.get('/messages', (req, res) =>
  forwardRequest(req, res, '/messages', 'GET'),
);
router.post('/messages', (req, res) =>
  forwardRequest(req, res, '/messages', 'POST'),
);
router.get('/sessions/:sessionId/messages', (req, res) =>
  forwardRequest(req, res, `/sessions/${req.params.sessionId}/messages`, 'GET'),
);
router.get('/messages/:messageId', (req, res) =>
  forwardRequest(req, res, `/messages/${req.params.messageId}`, 'GET'),
);
router.put('/messages/:messageId', (req, res) =>
  forwardRequest(req, res, `/messages/${req.params.messageId}`, 'PUT'),
);
router.delete('/messages/:messageId', (req, res) =>
  forwardRequest(req, res, `/messages/${req.params.messageId}`, 'DELETE'),
);
router.post('/messages/:messageId/regenerate', (req, res) =>
  forwardRequest(
    req,
    res,
    `/messages/${req.params.messageId}/regenerate`,
    'POST',
  ),
);
router.post('/messages/:messageId/feedback', (req, res) =>
  forwardRequest(
    req,
    res,
    `/messages/${req.params.messageId}/feedback`,
    'POST',
  ),
);

/**
 * Streaming Route
 */
router.post('/messages/stream', (req, res) =>
  forwardStreamRequest(req, res, '/messages/stream'),
);

/**
 * File Attachment Routes
 */
router.get('/attachments', (req, res) =>
  forwardRequest(req, res, '/attachments', 'GET'),
);
router.post('/attachments', (req, res) =>
  forwardRequest(req, res, '/attachments', 'POST'),
);
router.get('/attachments/:attachmentId', (req, res) =>
  forwardRequest(req, res, `/attachments/${req.params.attachmentId}`, 'GET'),
);
router.delete('/attachments/:attachmentId', (req, res) =>
  forwardRequest(req, res, `/attachments/${req.params.attachmentId}`, 'DELETE'),
);

/**
 * Search Routes
 */
router.get('/sessions/search', (req, res) =>
  forwardRequest(req, res, '/sessions/search', 'GET'),
);
router.get('/sessions/:sessionId/messages/search', (req, res) =>
  forwardRequest(
    req,
    res,
    `/sessions/${req.params.sessionId}/messages/search`,
    'GET',
  ),
);

/**
 * Session Actions Routes
 */
router.post('/sessions/:sessionId/star', (req, res) =>
  forwardRequest(req, res, `/sessions/${req.params.sessionId}/star`, 'POST'),
);
router.delete('/sessions/:sessionId/star', (req, res) =>
  forwardRequest(req, res, `/sessions/${req.params.sessionId}/star`, 'DELETE'),
);

/**
 * Bulk Operations Routes
 */
router.post('/sessions/bulk-delete', (req, res) =>
  forwardRequest(req, res, '/sessions/bulk-delete', 'POST'),
);
router.post('/messages/bulk-delete', (req, res) =>
  forwardRequest(req, res, '/messages/bulk-delete', 'POST'),
);

/**
 * Analytics Routes
 */
router.get('/sessions/:sessionId/analytics', (req, res) =>
  forwardRequest(
    req,
    res,
    `/sessions/${req.params.sessionId}/analytics`,
    'GET',
  ),
);
router.get('/stats', (req, res) => forwardRequest(req, res, '/stats', 'GET'));

export default router;
