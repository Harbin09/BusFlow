module.exports = {
  displayName: 'identity',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/modules/identity',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/index.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.enum.ts',
    '!src/infrastructure/config/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/test/**/*.spec.ts'],
  rootDir: '.',
};
