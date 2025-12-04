# Logger Module Changelog

All notable changes to the logger module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-01-27

#### HTML Viewer Enhancements

- Added date range picker (start date and end date filters)
- Added regex search toggle for advanced text search
- Added export buttons (CSV and JSON) in viewer UI
- Added pagination controls (Previous/Next buttons with page info)
- Added multi-file search toggle to search across all log files
- Enhanced viewer UI with improved styling and layout

#### Performance Optimizations

- Added in-memory caching for file listings (30-second TTL)
- Added in-memory caching for analyzed log results (10-second TTL)
- Added `clearFileListCache()` function for cache management
- Added streaming support for large log files (>10MB threshold)
- Implemented efficient file reading with streaming for large files

#### Documentation Updates

- Updated Next.js integration section with complete route examples
- Added pagination examples and usage patterns
- Added export functionality examples (CSV, JSON, file download)
- Added advanced database query examples
- Updated ILogger interface documentation with `getPinoLogger()` usage
- Enhanced log viewer service documentation with all new features

### Added - 2025-01-27

#### Logger Interface Enhancements

- Added `getPinoLogger()` method to `ILogger` interface (optional) for advanced Pino usage
- Updated `isILogger()` type guard to optionally check for `getPinoLogger()`

#### Next.js Integration

- Added `GET_DATABASE` handler for querying database logs
- Added `GET_SUMMARY` handler for summary statistics
- Added `GET_UI` handler to serve HTML log viewer interface
- Created `nextjs-router.ts` helper for flexible Next.js route configuration
- Added support for both App Router and Pages Router patterns
- Exported all Next.js handlers for direct use in route files

#### Export Functionality

- Added `exportLogsToCSV()` function to export logs in CSV format
- Added `exportLogsToJSON()` function to export logs in JSON format
- Added `downloadLogFile()` function for secure log file downloads
- Added Express routes: `/logs/export/csv`, `/logs/export/json`, `/logs/files/:filename/download`
- Added Next.js handlers: `GET_EXPORT_CSV`, `GET_EXPORT_JSON`, `GET_DOWNLOAD_FILE`

#### Pagination Support

- Added `page` and `pageSize` options to `LogViewerOptions` interface
- Implemented pagination in `getAnalyzedLogs()` function
- Implemented pagination in `queryDatabaseLogs()` using Supabase `.range()`
- Added pagination metadata to responses: `{ page, pageSize, total, totalPages, hasNext, hasPrev }`
- Updated Express and Next.js routes to accept `page` and `pageSize` query parameters

#### Database Query Enhancements

- Added multi-level filtering support (`levels[]` array parameter)
- Added `source` and `action` filtering to `queryDatabaseLogs()`
- Added `getLogStats()` function for aggregated statistics (by level, component, source)
- Added `getErrorTrends()` function for error trends over time (hour/day/week intervals)
- Added `getTopErrors()` function for most frequent errors
- Added Express routes: `/logs/database/stats`, `/logs/database/trends`, `/logs/database/top-errors`
- Enhanced date range filtering with `startTime` and `endTime` parameters

#### Exports

- Updated `index.ts` to export all new viewer functions and types
- Exported Next.js-specific handlers and router helpers
- Exported aggregation functions (`getLogStats`, `getErrorTrends`, `getTopErrors`)

### Changed - 2025-01-27

- `queryDatabaseLogs()` now returns `{ data, pagination }` object instead of array
- `getAnalyzedLogs()` now includes optional `pagination` metadata in response
- Database query responses include pagination metadata when pagination is used

### Fixed - 2025-01-27

- Next.js integration now complete with all route handlers
- Database query responses properly structured with pagination support

---

## [1.0.0] - 2025-01-27

### Added

- Initial release of logger module
- Universal runtime support (Node.js, Browser, Edge)
- Multi-dimensional categorization (`[source|action|component]`)
- Context propagation across async boundaries
- Multi-destination logging (Console, File, Database)
- Distributed tracing (Request ID, Trace ID, Session ID)
- Security features (PII scrubbing, error sanitization)
- Performance features (log sampling, batched database writes, backpressure handling)
- Framework integration (Express, Next.js, Fastify, Browser middleware)
- Custom log levels (user_action, notice, success, failure)
- Log viewer with HTML UI
- Basic Express and Next.js route handlers
- Database schema migration for Supabase

---

## Version History

- **1.0.0** - Initial release with core logging functionality
- **Unreleased** - Interface completeness, export functionality, pagination, and database enhancements
