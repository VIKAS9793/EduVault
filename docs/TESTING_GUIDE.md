# Production-Grade Testing Guide
## MAANG Standards for EduVault

> **ℹ️ Testing Framework (v2.1.0):** As of Dec 2025, EduVault uses **Vitest** (Jest-compatible). All `jest.fn()`, `jest.mock()` syntax works via compatibility shim.

### **🚀 Quick Start Commands**

```bash
# Run all tests with coverage
npm run test:ci

# Run specific test suites
npm run test:integration
npm run test:performance
npm run test:a11y

# Full verification pipeline
npm run verify:full

# Pre-commit checks
npm run precommit
```

### **📊 Coverage Requirements**

- **Global Coverage**: 90% (lines, branches, functions, statements)
- **Services Coverage**: 95% (critical business logic)
- **Components Coverage**: 85% (UI components)

### **🧪 Test Categories**

#### **1. Unit Tests**
- **Location**: `src/**/__tests__/*.test.{ts,tsx}`
- **Command**: `npm run test:ci`
- **Coverage**: 90% minimum
- **Focus**: Individual functions, methods, components

#### **2. Integration Tests**
- **Location**: `src/**/__tests__/integration/*.test.{ts,tsx}`
- **Command**: `npm run test:integration`
- **Focus**: Service interactions, API calls, data flow

#### **3. Performance Tests**
- **Location**: `src/**/__tests__/performance/*.test.{ts,tsx}`
- **Command**: `npm run test:performance`
- **Focus**: Load times, memory usage, rendering performance

#### **4. Accessibility Tests**
- **Location**: `src/**/__tests__/accessibility/*.test.{ts,tsx}`
- **Command**: `npm run test:a11y`
- **Focus**: WCAG 2.1 AA compliance, screen reader support

#### **5. Mutation Tests**
- **Command**: `npm run test:mutation`
- **Frequency**: Nightly
- **Focus**: Test suite effectiveness

### **🔧 Test Structure (AAA Pattern)**

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should_expected_behavior_when_condition', async () => {
      // Arrange - Set up test data and mocks
      const mockData = TestFactory.createMockData();
      const mockService = jest.mocked(service);
      
      // Act - Execute the code under test
      const result = await component.method(mockData);
      
      // Assert - Verify the expected outcome
      expect(result).toEqual(expectedResult);
      expect(mockService.method).toHaveBeenCalledWith(expectedArgs);
    });
  });
});
```

### **📋 Test Naming Conventions**

- **Unit Tests**: `test_[module]__[scenario]__[expected]`
- **Integration Tests**: `test_integration__[feature]__[outcome]`
- **Performance Tests**: `test_performance__[metric]__[threshold]`
- **Accessibility Tests**: `test_a11y__[feature]__[compliance]`

### **🎯 Test Quality Checklist**

#### **✅ Test Design**
- [ ] Tests behavior, not implementation
- [ ] Single responsibility per test
- [ ] Clear AAA structure
- [ ] Deterministic (no flaky tests)
- [ ] Fast execution (< 100ms per test)
- [ ] Isolated (no external dependencies)

#### **✅ Coverage**
- [ ] All public methods tested
- [ ] All branches covered
- [ ] Edge cases handled
- [ ] Error conditions tested
- [ ] Accessibility features verified

#### **✅ Maintainability**
- [ ] Uses test factories for data
- [ ] Mocks external dependencies
- [ ] Clear test descriptions
- [ ] Proper cleanup after tests
- [ ] No hardcoded values

### **🔍 Test Execution**

#### **Local Development**
```bash
# Watch mode for development
npm run test:watch

# Single test file
npm test -- ComponentName.test.tsx

# Specific test pattern
npm test -- --testNamePattern="should handle error"
```

#### **CI/CD Pipeline**
```bash
# Full CI pipeline
npm run verify:full

# Pre-commit hook
npm run precommit

# Pre-push hook
npm run prepush
```

### **📈 Coverage Reports**

#### **View Coverage**
```bash
# Generate coverage report
npm run test:ci

# Open coverage report
open coverage/lcov-report/index.html
```

#### **Coverage Thresholds**
- **Global**: 90% (configurable in jest.config.js)
- **Services**: 95% (critical business logic)
- **Components**: 85% (UI components)

### **🚨 Quality Gates**

#### **Blocking Conditions**
- [ ] ESLint errors
- [ ] TypeScript errors
- [ ] Test failures
- [ ] Coverage below threshold
- [ ] Security vulnerabilities
- [ ] Accessibility violations

#### **Non-Blocking Warnings**
- [ ] ESLint warnings (max 0)
- [ ] Performance regressions
- [ ] Mutation test failures

### **🔧 Test Utilities**

#### **Test Factories**
```typescript
// Use factories for consistent test data
const lesson = LessonFactory.createMinimal();
const ncertLesson = LessonFactory.createNCERTStyle();
const userProgress = TestDataFactory.createUserProgress('lesson-1');
```

#### **Mock Helpers**
```typescript
// Mock external services
jest.mock('../services/ContentManager');
const mockContentManager = contentManager as jest.Mocked<typeof contentManager>;

// Mock browser APIs
global.fetch = jest.fn();
global.speechSynthesis = mockSpeechSynthesis;
```

### **📊 Performance Benchmarks**

#### **Test Execution Time**
- **Unit Tests**: < 100ms per test
- **Integration Tests**: < 500ms per test
- **Full Suite**: < 2 minutes

#### **Memory Usage**
- **Per Test**: < 10MB
- **Full Suite**: < 500MB

### **🔄 Continuous Integration**

#### **Pipeline Stages**
1. **Lint & Type Check** (2 minutes)
2. **Unit Tests** (3 minutes)
3. **Integration Tests** (5 minutes)
4. **Security Scan** (2 minutes)
5. **Performance Tests** (3 minutes)
6. **Accessibility Tests** (2 minutes)
7. **Quality Gate** (1 minute)

#### **Failure Handling**
- **Fast Fail**: Stop on first failure
- **Retry Logic**: 3 attempts for flaky tests
- **Notification**: Slack/email on failure

### **📝 Test Documentation**

#### **Test Descriptions**
```typescript
/**
 * Tests the ContentManager service sync functionality
 * Verifies successful content synchronization from NCERT sources
 * Covers error handling and retry logic
 */
describe('ContentManager syncFromSource', () => {
  // Test implementation
});
```

#### **Coverage Documentation**
- Document any uncovered code with reasons
- Update coverage thresholds as needed
- Track coverage trends over time

### **🎯 Best Practices**

#### **DO**
- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Keep tests simple and focused
- ✅ Mock external dependencies
- ✅ Use factories for test data
- ✅ Clean up after tests

#### **DON'T**
- ❌ Test private methods directly
- ❌ Use real external services
- ❌ Create flaky tests
- ❌ Skip error conditions
- ❌ Ignore accessibility
- ❌ Hardcode test data

### **🚀 Advanced Testing**

#### **Property-Based Testing**
```typescript
// Use for invariant testing
import { fc } from 'fast-check';

it('should always return valid lesson for any input', () => {
  fc.assert(fc.property(fc.string(), (input) => {
    const result = lessonValidator.validate(input);
    expect(result.isValid).toBeDefined();
  }));
});
```

#### **Mutation Testing**
```bash
# Run mutation tests
npm run test:mutation

# Check mutation score
# Target: > 80% mutation score
```

### **📊 Metrics & Reporting**

#### **Key Metrics**
- **Test Coverage**: 90%+ global, 95%+ services
- **Test Execution Time**: < 2 minutes full suite
- **Flaky Test Rate**: < 1%
- **Mutation Score**: > 80%
- **Accessibility Score**: 100% WCAG 2.1 AA

#### **Reporting**
- **Coverage**: HTML reports in `coverage/`
- **Performance**: Lighthouse reports
- **Accessibility**: axe-core reports
- **Security**: Snyk reports

---

## **🎯 Production Readiness Checklist**

- [ ] All tests passing
- [ ] Coverage thresholds met
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Security scan clean
- [ ] Performance benchmarks met
- [ ] Accessibility compliance verified
- [ ] CI pipeline green
- [ ] Documentation updated

**Ready for Production Deployment! 🚀**
