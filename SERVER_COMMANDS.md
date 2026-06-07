# Server Commands Guide

## Overview

This document explains how to run the Online-PDF-CV server locally with verbose output showing all available URLs and endpoints.

## Available Commands

### 1. `npm start` (Recommended for production-like setup)

```bash
npm start
```

**What it does:**

- Runs the server using the `bin/www` file (Express.js standard setup)
- Uses HTTP server with proper error handling
- Default port: 3000 (or PORT environment variable)

**Output example:**

```
🚀 Starting server...
📦 Application: benyakoub-cv
🔧 Environment: development
🌐 Port: 3000
✅ Server successfully started!
🌍 Local URL: http://localhost:3000
📄 Your resume is available at: http://localhost:3000
📚 API documentation: http://localhost:3000/docs
🔍 Resume analyzer: http://localhost:3000/analyzer
⚖️  Resume comparison: http://localhost:3000/compare
📊 API versions: http://localhost:3000/api/versions

Press Ctrl+C to stop the server
```

### 2. `npm run dev` (Alternative direct method)

```bash
npm run dev
```

**What it does:**

- Runs the server directly from `app.js`
- Simpler setup, good for development
- Default port: 3000 (or PORT environment variable)

**Output example:**

```
🚀 Starting server directly from app.js...
📦 Application: benyakoub-cv
🔧 Environment: development
🌐 Port: 3000
✅ Server successfully started!
🌍 Local URL: http://localhost:3000
📄 Your resume is available at: http://localhost:3000
📚 API documentation: http://localhost:3000/docs
🔍 Resume analyzer: http://localhost:3000/analyzer
⚖️  Resume comparison: http://localhost:3000/compare
📊 API versions: http://localhost:3000/api/versions

Press Ctrl+C to stop the server
```

## Using Different Ports

If port 3000 is already in use, you can specify a different port:

### Windows PowerShell

```bash
$env:PORT=3001; npm start
# or
$env:PORT=3001; npm run dev
```

### Windows Command Prompt

```bash
SET PORT=3001 && npm start
# or
SET PORT=3001 && npm run dev
```

## Available Endpoints

Once the server is running, you can access:

| Endpoint                                 | Description                  |
| ---------------------------------------- | ---------------------------- |
| `http://localhost:3000/`                 | Main resume PDF              |
| `http://localhost:3000/docs`             | API documentation            |
| `http://localhost:3000/analyzer`         | Resume analyzer tool         |
| `http://localhost:3000/compare`          | Resume comparison tool       |
| `http://localhost:3000/api/versions`     | JSON API for resume versions |
| `http://localhost:3000/resume/default`   | Default resume version       |
| `http://localhost:3000/resume/{version}` | Specific resume version      |

## Error Handling

### Port Already in Use

If you see this error:

```
🚫 Error: Port 3000 is already in use
💡 Try using a different port: SET PORT=3001 && npm run dev
```

**Solutions:**

1. Use a different port (as shown above)
2. Stop the other process using port 3000
3. Find and kill the process: `netstat -ano | findstr :3000`

### Permission Errors

If you see:

```
🔒 Error: Port 3000 requires elevated privileges
💡 Try running as administrator or use a port > 1024
```

**Solutions:**

1. Use a port number higher than 1024
2. Run PowerShell as Administrator

## Differences Between Commands

| Feature          | `npm start`                            | `npm run dev`                |
| ---------------- | -------------------------------------- | ---------------------------- |
| Setup            | Uses `bin/www` (Express standard)      | Direct `app.js` execution    |
| Error Handling   | More robust HTTP server error handling | Basic Express error handling |
| Production Ready | ✅ Yes                                 | ⚠️ Development only          |
| Debug Support    | ✅ Built-in debug module               | ❌ Basic logging             |
| Recommended For  | Production, deployment                 | Quick development testing    |

## Troubleshooting

### Server Starts But No Output

- Make sure you're using the updated version with verbose logging
- Check if the server is actually running by visiting `http://localhost:3000`

### Cannot Access the Website

1. Verify the server started successfully (look for ✅ message)
2. Check the correct port number in the output
3. Try accessing `http://127.0.0.1:3000` instead of `localhost`
4. Check Windows Firewall settings

### Server Stops Immediately

- Check for syntax errors in the code
- Verify all dependencies are installed: `npm install`
- Check the error messages in the console output

## Next Steps

After starting the server successfully:

1. Visit `http://localhost:3000` to see your resume
2. Check `http://localhost:3000/docs` for API documentation
3. Test the analyzer tool at `http://localhost:3000/analyzer`
4. Compare resume versions at `http://localhost:3000/compare`
