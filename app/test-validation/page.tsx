'use client';

/**
 * VALIDATION & SANITIZATION TEST PAGE
 *
 * This page lets you test all validation and sanitization functions
 * with visual buttons and real-time results!
 */

import { useState } from 'react';
import { runAllValidationTests, quickValidationTest } from '@/lib/__test-validation';

export default function TestValidationPage() {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Capture console.log output
  const captureConsoleOutput = (fn: () => void) => {
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    console.error = (...args) => {
      logs.push('ERROR: ' + args.join(' '));
      originalError(...args);
    };

    fn();

    console.log = originalLog;
    console.error = originalError;

    return logs;
  };

  const handleRunAllTests = () => {
    setIsRunning(true);
    setOutput([]);

    setTimeout(() => {
      const logs = captureConsoleOutput(runAllValidationTests);
      setOutput(logs);
      setIsRunning(false);
    }, 100);
  };

  const handleQuickTest = () => {
    setIsRunning(true);
    setOutput([]);

    setTimeout(() => {
      const logs = captureConsoleOutput(quickValidationTest);
      setOutput(logs);
      setIsRunning(false);
    }, 100);
  };

  const handleClearOutput = () => {
    setOutput([]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      fontFamily: 'monospace',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}>
            🛡️ Validation & Sanitization Test Suite
          </h1>
          <p style={{ opacity: 0.9 }}>
            Test all validation schemas and sanitization functions
          </p>
          <p style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '0.5rem' }}>
            💡 Check browser console (F12) for detailed logs
          </p>
        </div>

        {/* Controls */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={handleRunAllTests}
            disabled={isRunning}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.6 : 1,
              fontSize: '1rem',
            }}
          >
            {isRunning ? '⏳ Running...' : '🚀 Run All Tests'}
          </button>

          <button
            onClick={handleQuickTest}
            disabled={isRunning}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.6 : 1,
              fontSize: '1rem',
            }}
          >
            ⚡ Quick Test
          </button>

          <button
            onClick={handleClearOutput}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            🗑️ Clear Output
          </button>
        </div>

        {/* Test Info */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            📋 What Gets Tested
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#334155', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Validation</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                Journal, Expense, Task, Auth schemas
              </div>
            </div>

            <div style={{ backgroundColor: '#334155', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🛡️</div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>XSS Prevention</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                Detects and blocks malicious code
              </div>
            </div>

            <div style={{ backgroundColor: '#334155', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🧹</div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Sanitization</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                HTML, URLs, plain text cleaning
              </div>
            </div>

            <div style={{ backgroundColor: '#334155', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔐</div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Security</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                Email, password, file validation
              </div>
            </div>
          </div>
        </div>

        {/* Output Console */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '1rem',
          padding: '1.5rem',
          minHeight: '400px',
          maxHeight: '600px',
          overflowY: 'auto',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #334155',
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
              📊 Test Output
            </h3>
            {output.length > 0 && (
              <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                {output.length} lines
              </span>
            )}
          </div>

          {output.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              opacity: 0.5,
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧪</div>
              <div>Click a button above to run tests</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Results will appear here and in the browser console
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#0f172a',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.6',
            }}>
              {output.map((line, index) => {
                // Color coding based on content
                let color = '#e2e8f0';
                let fontWeight = 'normal';

                if (line.includes('✅') || line.includes('PASS')) {
                  color = '#10b981';
                } else if (line.includes('❌') || line.includes('FAIL') || line.includes('ERROR')) {
                  color = '#ef4444';
                } else if (line.includes('🧪')) {
                  color = '#3b82f6';
                  fontWeight = 'bold';
                } else if (line.includes('===')) {
                  color = '#6b7280';
                } else if (line.includes('🎉')) {
                  color = '#f59e0b';
                  fontWeight = 'bold';
                }

                return (
                  <div
                    key={index}
                    style={{
                      color,
                      fontWeight,
                      marginBottom: '0.25rem',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#1e3a8a',
          borderRadius: '1rem',
          border: '1px solid #3b82f6',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            📖 How to Use
          </h3>
          <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><strong>Press F12</strong> to open browser console (detailed logs)</li>
            <li><strong>Click "Run All Tests"</strong> to test everything (12 tests)</li>
            <li><strong>Click "Quick Test"</strong> for essential tests only (3 tests)</li>
            <li><strong>Look for</strong> ✅ (pass) and ❌ (fail) symbols</li>
            <li><strong>All tests should pass</strong> - if they don't, check the error messages</li>
          </ol>
        </div>

        {/* Success Criteria */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#166534',
          borderRadius: '1rem',
          border: '1px solid #22c55e',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            ✅ Success Criteria
          </h3>
          <div style={{ lineHeight: '1.8' }}>
            <div>✓ All validation tests pass</div>
            <div>✓ XSS attacks are blocked</div>
            <div>✓ Invalid data is rejected</div>
            <div>✓ Error messages are helpful</div>
            <div>✓ Sanitization removes dangerous code</div>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #22c55e' }}>
              If all tests pass, your app is protected! 🛡️
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
