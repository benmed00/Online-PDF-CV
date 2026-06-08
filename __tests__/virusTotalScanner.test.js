const {
  evaluateVerdict,
  sha256,
  scanUploadedFile,
  MALICIOUS_BLOCK_THRESHOLD,
  SUSPICIOUS_BLOCK_THRESHOLD,
} = require('../utils/virusTotalScanner');
const AppError = require('../utils/AppError');

describe('virusTotalScanner', () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.VIRUSTOTAL_API_KEY;

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalKey === undefined) {
      delete process.env.VIRUSTOTAL_API_KEY;
    } else {
      process.env.VIRUSTOTAL_API_KEY = originalKey;
    }
  });

  describe('evaluateVerdict', () => {
    test('returns clean for low detection counts', () => {
      expect(evaluateVerdict({ malicious: 0, suspicious: 0, harmless: 60 })).toBe('clean');
    });

    test('returns malicious when threshold met', () => {
      expect(evaluateVerdict({ malicious: MALICIOUS_BLOCK_THRESHOLD, suspicious: 0 })).toBe(
        'malicious'
      );
    });

    test('returns suspicious when suspicious threshold met', () => {
      expect(
        evaluateVerdict({ malicious: 0, suspicious: SUSPICIOUS_BLOCK_THRESHOLD, harmless: 10 })
      ).toBe('suspicious');
    });
  });

  describe('scanUploadedFile', () => {
    test('skips scan when API key is missing', async () => {
      delete process.env.VIRUSTOTAL_API_KEY;
      const buffer = Buffer.from('safe resume content for testing purposes only');

      const report = await scanUploadedFile(buffer, 'resume.txt');
      expect(report.scanned).toBe(false);
      expect(report.skipped).toBe(true);
    });

    test('uses cached VirusTotal report for known hash', async () => {
      process.env.VIRUSTOTAL_API_KEY = 'test-key';
      const buffer = Buffer.from('cached clean resume text for unit testing only');
      const hash = sha256(buffer);

      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          data: {
            attributes: {
              last_analysis_stats: {
                malicious: 0,
                suspicious: 0,
                harmless: 70,
                undetected: 3,
              },
            },
          },
        }),
      });

      const report = await scanUploadedFile(buffer, 'resume.txt');
      expect(report.scanned).toBe(true);
      expect(report.verdict).toBe('clean');
      expect(report.sha256).toBe(hash);
      expect(report.source).toBe('cache');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/files/${hash}`),
        expect.objectContaining({ headers: expect.objectContaining({ 'x-apikey': 'test-key' }) })
      );
    });

    test('blocks malicious uploads', async () => {
      process.env.VIRUSTOTAL_API_KEY = 'test-key';
      const buffer = Buffer.from('malicious sample for testing');

      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          data: {
            attributes: {
              last_analysis_stats: {
                malicious: 5,
                suspicious: 1,
                harmless: 10,
              },
            },
          },
        }),
      });

      await expect(scanUploadedFile(buffer, 'bad.exe')).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    test('handles rate limiting', async () => {
      process.env.VIRUSTOTAL_API_KEY = 'test-key';
      const buffer = Buffer.from('rate limited file');

      global.fetch = jest.fn().mockResolvedValue({ status: 429, ok: false });

      await expect(scanUploadedFile(buffer, 'resume.docx')).rejects.toBeInstanceOf(AppError);
    });
  });
});
