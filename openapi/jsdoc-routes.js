/**
 * OpenAPI path definitions (source of truth for routes).
 * Generated into openapi/openapi.yaml via `npm run openapi:generate`.
 * Keep in sync with handlers in app.js.
 *
 * @see scripts/generate-openapi.js
 * @see openapi/openapi.base.yaml — shared metadata and component schemas
 */

/**
 * @openapi
 * /api/versions:
 *   get:
 *     operationId: listResumeVersions
 *     tags: [Versions]
 *     summary: List available resume versions
 *     description: Returns JSON with version slugs and a base URL for PDF downloads.
 *     responses:
 *       200:
 *         description: Version list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VersionsResponse'
 *             example:
 *               versions: ['default', 'technical', 'executive']
 *               count: 3
 *               baseUrl: 'https://benyakoub-cv.firebaseapp.com/resume/'
 *       404:
 *         description: Endpoint not available on static hosting without Express
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/openapi.yaml:
 *   get:
 *     operationId: getOpenApiSpec
 *     tags: [Versions]
 *     summary: OpenAPI specification document
 *     description: Machine-readable API contract (YAML). Served statically on Firebase after build.
 *     responses:
 *       200:
 *         description: OpenAPI 3.1 YAML document
 *         content:
 *           application/yaml:
 *             schema:
 *               type: string
 *       404:
 *         description: Spec file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/analyzer/config:
 *   get:
 *     operationId: getAnalyzerConfig
 *     tags: [Analyzer]
 *     summary: Analyzer capability flags
 *     description: Reports which optional server features are configured. Requires Node runtime (Express locally or Cloud Function on Firebase).
 *     x-node-runtime: true
 *     responses:
 *       200:
 *         description: Analyzer configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyzerConfigResponse'
 *       404:
 *         description: Node runtime not available (deploy Cloud Function or run Express locally)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/analyze:
 *   post:
 *     operationId: analyzeResume
 *     tags: [Analyzer]
 *     summary: Analyze resume text
 *     description: Runs keyword scoring, best-practice checks, and suggestions. Optionally calls OpenAI when OPENAI_API_KEY is set and useAi is true. Requires Node runtime (Express locally or Cloud Function on Firebase).
 *     x-node-runtime: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnalyzeRequest'
 *     responses:
 *       200:
 *         description: Analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyzeSuccessResponse'
 *       400:
 *         description: Validation error or invalid target role
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/AnalyzeValidationError'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/extract-resume:
 *   post:
 *     operationId: extractResumeFromUpload
 *     tags: [Analyzer]
 *     summary: Upload and extract resume text
 *     description: Accepts a CV file (max 10 MB), optionally scans with VirusTotal, then extracts plain text. Requires Node runtime (Express locally or Cloud Function on Firebase).
 *     x-node-runtime: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CV document (supported extensions listed in GET /api/analyzer/config)
 *     responses:
 *       200:
 *         description: Text extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExtractSuccessResponse'
 *       400:
 *         description: Missing file, unsupported type, or file too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Upload blocked by VirusTotal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Could not extract enough text from file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       503:
 *         description: VirusTotal scan failed or rate limited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       504:
 *         description: VirusTotal scan timed out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /resume:
 *   get:
 *     operationId: downloadDefaultResume
 *     tags: [Resume]
 *     summary: Download default resume PDF
 *     description: Returns the default resume PDF. Falls back to public/resume.pdf if no version file exists.
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Resume not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /resume/{version}:
 *   get:
 *     operationId: downloadResumeVersion
 *     tags: [Resume]
 *     summary: Download a specific resume version
 *     description: Returns a versioned PDF from public/resumes/{version}.pdf, or the default PDF as fallback.
 *     parameters:
 *       - name: version
 *         in: path
 *         required: true
 *         description: Version slug (lowercase letters, numbers, hyphens)
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         examples:
 *           technical:
 *             value: technical
 *           executive:
 *             value: executive
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid version slug
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Resume not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

module.exports = {};
