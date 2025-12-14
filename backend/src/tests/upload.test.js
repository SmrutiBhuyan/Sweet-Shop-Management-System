const upload = require('../middleware/upload');
const path = require('path');

describe('Upload Middleware', () => {
  describe('File Filter', () => {
    it('should accept valid image files', () => {
      const validImageTypes = [
        { mimetype: 'image/jpeg', originalname: 'test.jpg' },
        { mimetype: 'image/png', originalname: 'test.png' },
        { mimetype: 'image/gif', originalname: 'test.gif' },
        { mimetype: 'image/webp', originalname: 'test.webp' },
        { mimetype: 'image/svg+xml', originalname: 'test.svg' }
      ];

      validImageTypes.forEach((file) => {
        const cb = jest.fn();
        upload.fileFilter(null, file, cb);
        expect(cb).toHaveBeenCalledWith(null, true);
        cb.mockClear();
      });
    });

    it('should reject non-image files', () => {
      const invalidFileTypes = [
        { mimetype: 'application/pdf', originalname: 'document.pdf' },
        { mimetype: 'text/plain', originalname: 'script.txt' },
        { mimetype: 'application/x-msdownload', originalname: 'malicious.exe' },
        { mimetype: 'application/x-php', originalname: 'script.php' },
        { mimetype: 'application/javascript', originalname: 'script.js' }
      ];

      invalidFileTypes.forEach((file) => {
        const cb = jest.fn();
        upload.fileFilter(null, file, cb);
        expect(cb).toHaveBeenCalledWith(
          expect.objectContaining({ 
            message: 'Only image files are allowed!' 
          }), 
          false
        );
        cb.mockClear();
      });
    });

    it('should accept files with no extension but correct mimetype', () => {
      const file = {
        mimetype: 'image/jpeg',
        originalname: 'testfile' // No extension
      };
      const cb = jest.fn();
      
      upload.fileFilter(null, file, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });
  });

  describe('Storage Configuration', () => {
    it('should generate sanitized filenames', () => {
      const storage = upload.storage;
      const testCases = [
        { originalname: 'simple.jpg', expectedPattern: /simple-\d+-\d+\.jpg$/ },
        { originalname: 'file with spaces.jpg', expectedPattern: /file-with-spaces-\d+-\d+\.jpg$/ },
        { originalname: 'UPPERCASE.JPG', expectedPattern: /UPPERCASE-\d+-\d+\.jpg$/ },
        { originalname: 'special_chars@test.jpg', expectedPattern: /special_chars@test-\d+-\d+\.jpg$/ },
        { originalname: 'test.PNG', expectedPattern: /test-\d+-\d+\.png$/ },
        { originalname: 'very-long-filename-with-multiple-words-and-special-characters.jpg', 
          expectedPattern: /very-long-filename-with-multiple-words-and-special-characters-\d+-\d+\.jpg$/ }
      ];

      testCases.forEach((testCase) => {
        const cb = jest.fn();
        storage.getFilename(null, { originalname: testCase.originalname }, cb);
        
        const filename = cb.mock.calls[0][0];
        expect(typeof filename).toBe('string');
        expect(filename).toMatch(testCase.expectedPattern);
        
        // Should not contain dangerous characters
        expect(filename).not.toContain('..');
        expect(filename).not.toContain('<');
        expect(filename).not.toContain('>');
        expect(filename).not.toContain(':');
        expect(filename).not.toContain('"');
        expect(filename).not.toContain('|');
        expect(filename).not.toContain('?');
        expect(filename).not.toContain('*');
      });
    });

    it('should preserve file extensions', () => {
      const storage = upload.storage;
      const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.JPG', '.JPEG', '.PNG'];
      
      extensions.forEach((ext) => {
        const cb = jest.fn();
        storage.getFilename(null, { originalname: `test${ext}` }, cb);
        
        const filename = cb.mock.calls[0][0];
        expect(filename.endsWith(ext.toLowerCase())).toBe(true);
      });
    });
  });

  describe('Limits Configuration', () => {
    it('should enforce 5MB file size limit', () => {
      expect(upload.limits.fileSize).toBe(5 * 1024 * 1024); // 5MB
    });

    it('should have limits defined', () => {
      expect(upload.limits).toBeDefined();
      expect(typeof upload.limits).toBe('object');
    });
  });

  describe('Middleware Export', () => {
    it('should export multer middleware correctly', () => {
      expect(upload).toBeDefined();
      expect(typeof upload).toBe('function');
      
      // Should have multer middleware properties
      expect(upload.single).toBeDefined();
      expect(typeof upload.single).toBe('function');
      
      expect(upload.array).toBeDefined();
      expect(typeof upload.array).toBe('function');
      
      expect(upload.fields).toBeDefined();
      expect(typeof upload.fields).toBe('function');
    });

    it('should have storage configuration', () => {
      expect(upload.storage).toBeDefined();
      expect(upload.storage.getDestination).toBeDefined();
      expect(typeof upload.storage.getDestination).toBe('function');
      
      expect(upload.storage.getFilename).toBeDefined();
      expect(typeof upload.storage.getFilename).toBe('function');
    });

    it('should have fileFilter function', () => {
      expect(upload.fileFilter).toBeDefined();
      expect(typeof upload.fileFilter).toBe('function');
    });
  });

  describe('Security Considerations', () => {
    it('should prevent path traversal in filenames', () => {
      const storage = upload.storage;
      const maliciousNames = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        'normal.jpg\0malicious.exe', // null byte injection
        'file; rm -rf /;.jpg',
        '<script>alert("xss")</script>.jpg'
      ];

      maliciousNames.forEach((name) => {
        const cb = jest.fn();
        storage.getFilename(null, { originalname: name }, cb);
        
        const filename = cb.mock.calls[0][0];
        // Should sanitize dangerous characters
        expect(filename).not.toContain('..');
        expect(filename).not.toContain('\\');
        expect(filename).not.toContain('<');
        expect(filename).not.toContain('>');
        expect(filename).not.toContain(';');
        expect(filename).not.toContain('rm');
        expect(filename).not.toContain('script');
      });
    });

    it('should handle empty or invalid filenames', () => {
      const storage = upload.storage;
      const testCases = [
        { originalname: '', description: 'empty filename' },
        { originalname: '.jpg', description: 'only extension' },
        { originalname: '   ', description: 'whitespace only' },
        { originalname: null, description: 'null filename' },
        { originalname: undefined, description: 'undefined filename' }
      ];

      testCases.forEach((testCase) => {
        const cb = jest.fn();
        storage.getFilename(null, { originalname: testCase.originalname }, cb);
        
        const filename = cb.mock.calls[0][0];
        expect(typeof filename).toBe('string');
        expect(filename.length).toBeGreaterThan(0);
      });
    });
  });
});