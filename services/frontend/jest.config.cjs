const nextJest = require('next/jest'); 

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  dir: './',
});

// Configuración personalizada de Jest
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],

  // --- MODIFICACIÓN DE moduleNameMapper ---
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/$1',
    // Mockear componentes/iconos de forma específica
    '^@heroicons/react/24/outline$': '<rootDir>/__mocks__/componentMocks.js',
    '^../components/Layout$': '<rootDir>/__mocks__/componentMocks.js',
  },
  // --- FIN DE LA MODIFICACIÓN ---
};

module.exports = createJestConfig(customJestConfig);