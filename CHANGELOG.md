# Changelog

All notable changes to fast-access will be documented in this file.

## [1.6.1] - 2026-02-22

### Fixed
- Add background service worker to handle toolbar icon click (opens new tab)
- Fix Chrome Web Store rejection: "New tab" functionality now accessible via toolbar icon
- Change action default_title from "fast-access Settings" to "Open New Tab"

## [1.5.3] - 2026-01-22

### Fixed
- Remove unused `topSites` and `favicon` permissions (Chrome Store policy compliance)

### Changed
- Clean up residual search CSS styles from removed feature

## [1.5.2] - 2026-01-22

### Fixed
- Import feature now correctly uses chunked storage mechanism
- Imported data now persists after page refresh

### Added
- SVG cleaning on import: removes empty `<g>` elements, XML declarations, comments, and redundant whitespace
- Reduces storage size for imported SVG icons

## [1.5.1] - 2026-01-22

### Added
- SVG file upload feature for shortcut icons
- Icon preview when adding/editing shortcuts
- "Paste SVG Code" and "Upload SVG" buttons replace the textarea input
- SVG size validation with warning for files over 7KB

### Changed
- Icon input UI redesigned with button-based interface (matching settings page style)

## [1.5.0] - 2026-01-22

### Added
- Data chunking for Chrome Sync storage, breaks 8KB per-item limit
- Support for 100+ shortcuts with SVG icons

### Technical
- `saveDialsInChunks()`: Stores dials in 7KB chunks
- `loadDialsFromChunks()`: Merges chunks when loading
- `cleanupOldChunks()`: Cleans up old format data
- Backward compatible with old data format

## [1.4.0] - 2026-01-22

### Changed
- Import dialog now uses in-page modal instead of browser alert
- Enhanced drag-and-drop with Notion-style visual feedback

## [1.3.0]

### Added
- Support importing Speed Dial 2 configuration files
- Improved data management interface

## [1.2.0]

### Added
- Multi-language support (5 languages: English, Simplified Chinese, Traditional Chinese, Japanese, Spanish)

## [1.1.0]

### Changed
- Removed search bar, focus on shortcuts
- Removed clock display, cleaner interface
- Optimized settings page layout

### Fixed
- Items per row setting not working

## [1.0.0]

### Added
- Initial release
- Basic shortcut management
- Chrome Sync support
