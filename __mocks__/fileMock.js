/**
 * FILE MOCK
 *
 * When Jest encounters an image or other file import, it uses this file instead.
 * We don't need actual images in tests - we just need the import to not fail.
 */

module.exports = 'test-file-stub';
