export default {
  pollingAlerts: 5000, // milliseconds for polling /api/:orgId/device/:deviceId/alert
  pollingBenchmark: 10000, // milliseconds for polling /api/:orgId/device/:deviceId/diagnostic/benchmark
  WCM_activeDevice: 'WCM_activeDevice', // the name of the key in localStorage which keeps the active device between page reloads
  ERR_CODE:
    {
      // General
      UNKNOWN: 1,                 // HTTP 500 - Unknown error occurred.
      SERVICE_UNAVAILABLE: 2,     // HTTP 503 - Service unavailable e.g. during maintenance.
      NOT_FOUND: 3,               // HTTP 404 - API or page not found.
      // Authentication and Authorization
      UNAUTHENTICATED: 100,       // HTTP 401 - User not logged in, require authentication.
      UNAUTHORIZED: 101,          // HTTP 403 - Permission denied, user not authorized for the action.
      AUTHENTICATION_FAILED: 102, // HTTP 400 - Username or password is incorrect during login.
      // Resource
      RESOURCE_NOT_FOUND: 200,    // HTTP 400 - Resource not found e.g. invalid device ID.
      ALREADY_EXISTS: 201,        // HTTP 409 - Attempting to create a resource that already exists.
      DEVICE_OFFLINE: 202,        // HTTP 502 - The specific Wanos device is currently offline.
      // URI or Query parameters
      INVALID_ARGUMENT: 300,      // HTTP 400 - Client supplied argument is invalid e.g. invalid date range.
      VALIDATION: 400,            // HTTP 400 - Validation error on post.
      // RPC
      DEADLINE_EXCEEDED: 600,     // HTTP 504 - RPC to Wanos device timed out.
      // General notification
      PEER_REMOVED: 701,
    },
  VALIDATION_CODE:
    {
      // All
      REQUIRED: 1,
      INVALID_TYPE: 2,
      UNIQUE: 3,
      // Strings
      MIN_LENGTH: 100,
      MAX_LENGTH: 101,
      COMPARE: 102,
      ENUM: 103,
      // Numbers
      MIN_RANGE: 201,
      MAX_RANGE: 202,
      // Password
      INVALID_PASSWORD: 300,
    },
  LOG_LEVELS:
  [
    {
      text: 'Debug',
      value: 'debug',
    },
    {
      text: 'Informational',
      value: 'info',
    },
    {
      text: 'Warnings',
      value: 'warn',
    },
    {
      text: 'Errors',
      value: 'error',
    },
  ],
  DSCP_VALUES:
  [
    'CS0',
    'CS1',
    'AF11',
    'AF12',
    'AF13',
    'CS2',
    'AF21',
    'AF22',
    'AF23',
    'CS3',
    'AF31',
    'AF32',
    'AF33',
    'CS4',
    'AF41',
    'AF42',
    'AF43',
    'CS5',
    'EF',
    'CS6',
    'CS7',
  ]
}
