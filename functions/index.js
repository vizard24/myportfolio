const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
const next = require("next");

// Load environment variables
require('dotenv').config();

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

// Initialize Next.js app
const nextjsDistDir = require("./next.config.js").distDir || ".next";
const nextjsServer = next({
  dev: false,
  conf: {
    distDir: nextjsDistDir,
  },
});
const nextjsHandle = nextjsServer.getRequestHandler();

// Export the Next.js function
exports.nextjsFunc = onRequest(
  {
    memory: "2GiB",
    timeoutSeconds: 120,
    maxInstances: 5,
  },
  async (req, res) => {
    await nextjsServer.prepare();
    return nextjsHandle(req, res);
  }
);

// AI functionality is handled through the Next.js app via nextjsFunc
