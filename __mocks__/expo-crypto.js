const CryptoDigestAlgorithm = {
  MD5: 'MD5',
  SHA1: 'SHA-1',
  SHA256: 'SHA-256',
  SHA384: 'SHA-384',
  SHA512: 'SHA-512',
};

module.exports = {
  CryptoDigestAlgorithm,
  digestStringAsync: jest.fn(async () => 'mock-digest'),
  getRandomBytesAsync: jest.fn(async byteCount => new Uint8Array(byteCount)),
};
