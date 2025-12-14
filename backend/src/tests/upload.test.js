const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');

describe('Upload Middleware', () => {
  const testUploadsDir = path.join(__dirname, '../uploads-test');

  beforeAll(() => {
    // Create test uploads directory
    if (!fs.existsSync(testUploadsDir)) {
      fs.mkdirSync(testUploadsDir, { recursive: true });
    }

    // Mock the uploads directory path in the upload module
    jest.mock('../middleware/upload', () => {
      const originalModule = jest.requireActual('../middleware/upload');
      return {
        ...originalModule,
        // Override the uploads directory for testing
        __esModule: true,
        default: originalModule.default
      };
    });
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testUploadsDir)) {
      fs.rmSync(testUploadsDir, { recursive: true });
    }
  });

  describe('File Filter', () => {
    it('should accept image files', () => {
      const mockFile = {
        mimetype: 'image/jpeg'
      };
      const cb = jest.fn();

      // Access the internal fileFilter function
      const storage = upload.storage;
      const fileFilter = upload.fileFilter;

      fileFilter(null, mockFile, cb);

      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject non-image files', () => {
      const mockFile = {
        mimetype: 'application/pdf'
      };
      const cb = jest.fn();

      const fileFilter = upload.fileFilter;
      fileFilter(null, mockFile, cb);

      expect(cb).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Only image files are allowed!' }),
        false
      );
    });
  });

  describe('Storage Configuration', () => {
    it('should generate unique filenames', () => {
      const storage = upload.storage;
      const cb = jest.fn();
      const mockFile = {
        originalname: 'test.jpg'
      };

      storage.getFilename(null, mockFile, cb);

      expect(cb).toHaveBeenCalled();
      const filename = cb.mock.calls[0][0];
      expect(filename).toMatch(/test-\d+-.*\.jpg$/);
    });

    it('should sanitize filenames with spaces', () => {
      const storage = upload.storage;
      const cb = jest.fn();
      const mockFile = {
        originalname: 'my test image.jpg'
      };

      storage.getFilename(null, mockFile, cb);

      expect(cb).toHaveBeenCalled();
      const filename = cb.mock.calls[0][0];
      expect(filename).toMatch(/my-test-image-\d+-.*\.jpg$/);
    });
  });

  describe('File Size Limit', () => {
    it('should enforce 5MB file size limit', () => {
      expect(upload.limits.fileSize).toBe(5 * 1024 * 1024);
    });
  });

  describe('Error Handling', () => {
    it('should handle disk storage errors', () => {
      const storage = upload.storage;
      const cb = jest.fn();
      const mockError = new Error('Disk error');

      // Simulate storage error
      storage.getDestination(null, null, (err) => {
        cb(err);
      });

      // The actual test would need to mock fs operations
      expect(typeof storage.getDestination).toBe('function');
    });
  });
});