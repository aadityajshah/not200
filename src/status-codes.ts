export type StatusCodeInfo = {
    code: number;
    name: string;
    description: string;
    emoji: string;
  };
  
  const CODES: Record<number, StatusCodeInfo> = {
    400: {
      code: 400,
      name: 'Bad Request',
      description:
        'The server cannot process the request due to something that is perceived to be a client error.',
      emoji: '❌',
    },
    401: {
      code: 401,
      name: 'Unauthorized',
      description:
        'The request has not been applied because it lacks valid authentication credentials.',
      emoji: '🔑',
    },
    403: {
      code: 403,
      name: 'Forbidden',
      description: 'The server understood the request but refuses to authorize it.',
      emoji: '🚫',
    },
    404: {
      code: 404,
      name: 'Not Found',
      description: 'The server cannot find the requested resource.',
      emoji: '🔍',
    },
    418: {
      code: 418,
      name: "I'm a teapot",
      description: 'The server refuses the attempt to brew coffee with a teapot.',
      emoji: '☕',
    },
    429: {
      code: 429,
      name: 'Too Many Requests',
      description:
        'The user has sent too many requests in a given amount of time.',
      emoji: '🐌',
    },
    500: {
      code: 500,
      name: 'Internal Server Error',
      description:
        'The server encountered an unexpected condition that prevented it from fulfilling the request.',
      emoji: '💥',
    },
    502: {
      code: 502,
      name: 'Bad Gateway',
      description:
        'The server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed.',
      emoji: '🔌',
    },
    503: {
      code: 503,
      name: 'Service Unavailable',
      description: 'The server is not ready to handle the request.',
      emoji: '🚧',
    },
    504: {
      code: 504,
      name: 'Gateway Timeout',
      description:
        'The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.',
      emoji: '⏱️',
    },
  };
  
  export function getStatusInfo(statusCode: number): StatusCodeInfo {
    return (
      CODES[statusCode as keyof typeof CODES] || {
        code: statusCode,
        name: 'Unknown Status',
        description: 'This status code is not in our database.',
        emoji: '❓',
      }
    );
  }
  