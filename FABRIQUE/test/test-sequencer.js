const Sequencer = require('@jest/test-sequencer').default;
const path = require('path');

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Test order:
    // 1. Unit tests
    // 2. Integration tests
    // 3. E2E tests
    const testPaths = tests.map(test => test.path);
    
    // Sort test paths to ensure a consistent order
    const orderedTests = Array.from(tests).sort((testA, testB) => {
      // Put health check tests first
      if (testA.path.includes('health') || testB.path.includes('health')) {
        return testA.path.includes('health') ? -1 : 1;
      }
      // Then unit tests
      if (testA.path.includes('.spec.') || testB.path.includes('.spec.')) {
        return testA.path.includes('.spec.') ? -1 : 1;
      }
      // Then integration tests
      if (testA.path.includes('.int-spec.') || testB.path.includes('.int-spec.')) {
        return testA.path.includes('.int-spec.') ? -1 : 1;
      }
      // Finally E2E tests
      return 0;
    });

    return orderedTests;
  }
}

module.exports = CustomSequencer;
