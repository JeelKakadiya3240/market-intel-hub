import dotenv from "dotenv";

// Load environment variables from .env file FIRST
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { SupabaseStorage } from "./storage";

// Graceful environment validation for deployment
function validateEnvironment(): void {
  // Check for SUPABASE_URL
  if (!process.env.SUPABASE_URL) {
    console.warn('⚠️  SUPABASE_URL not found - some features may not work');
  }
  
  // Check for SUPABASE_ANON_KEY
  if (!process.env.SUPABASE_ANON_KEY) {
    console.warn('⚠️  SUPABASE_ANON_KEY not found - some features may not work');
  }
  
  console.log('✅ Environment validation completed');
}



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Validate environment variables before starting server
  validateEnvironment();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    log("🔧 Setting up Vite development server...");
    await setupVite(app, server);
    log("✅ Vite development server ready");
  } else {
    log("📦 Serving static files for production...");
    serveStatic(app);
  }

  // Port configuration for Cloud Run and deployment compatibility
  // Priority order: PORT env var (Cloud Run) -> 8080 (Cloud Run default) -> 5000 (Replit dev)
  const port = process.env.PORT 
    ? parseInt(process.env.PORT, 10) 
    : (process.env.NODE_ENV === "production" ? 8080 : 5000);
  
  const serverOptions = {
    port,
    host: "0.0.0.0",
    ...(process.env.NODE_ENV === "development" && { reusePort: true }),
  };

  // Add process signal handlers for graceful shutdown
  let serverInstance: any;
  
  const gracefulShutdown = (signal: string) => {
    log(`📡 Received ${signal}, starting graceful shutdown...`);
    if (serverInstance) {
      serverInstance.close(() => {
        log(`✅ Server closed gracefully`);
        process.exit(0);
      });
      
      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        log(`⚠️  Forced shutdown after timeout`);
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };
  
  // Register signal handlers for Cloud Run
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions and rejections
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  serverInstance = server.listen(serverOptions, async () => {
    log(`✅ Server successfully started and serving on port ${port}`);
    log(`🌍 Server accessible at http://0.0.0.0:${port}`);
    log(`📡 Health check available at: http://0.0.0.0:${port}/health`);
    if (process.env.NODE_ENV === "development") {
      log(`🛠️  Running in development mode`);
    } else {
      log(`🚀 Running in production mode`);
    }
    
  }).on('error', (error: any) => {
    console.error(`❌ Server startup error:`, error.message);
    
    // More specific error handling
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
    } else if (error.code === 'EACCES') {
      console.error(`❌ Permission denied to bind to port ${port}`);
    }
    
    console.error('❌ Server failed to start, exiting...');
    process.exit(1);
  });
})();
