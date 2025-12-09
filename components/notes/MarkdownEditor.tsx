'use client';

/**
 * MARKDOWN EDITOR COMPONENT
 *
 * A split-view markdown editor with:
 * - Left side: Editable textarea
 * - Right side: Live markdown preview
 * - Tab support
 * - Syntax highlighting in preview
 */

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing your note...',
  disabled = false
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '400px',
    }}>
      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '2px solid var(--border-light)',
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          disabled={disabled}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'write' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'write' ? 'var(--primary-500)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'write' ? '600' : '400',
            fontSize: 'var(--text-base)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            marginBottom: '-2px',
            transition: 'all var(--transition-base)',
          }}
        >
          ✏️ Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          disabled={disabled}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'preview' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'preview' ? 'var(--primary-500)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'preview' ? '600' : '400',
            fontSize: 'var(--text-base)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            marginBottom: '-2px',
            transition: 'all var(--transition-base)',
          }}
        >
          👁️ Preview
        </button>
      </div>

      {/* Editor Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'write' ? (
          // Write Mode - Textarea
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              flex: 1,
              width: '100%',
              padding: '1rem',
              fontSize: 'var(--text-base)',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
              lineHeight: '1.6',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              resize: 'vertical',
              minHeight: '300px',
              outline: 'none',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />
        ) : (
          // Preview Mode - Rendered Markdown
          <div style={{
            flex: 1,
            padding: '1rem',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            overflowY: 'auto',
            minHeight: '300px',
          }}>
            {value.trim() ? (
              <div style={{
                color: 'var(--text-primary)',
                lineHeight: '1.6',
              }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        color: 'var(--text-primary)',
                        borderBottom: '2px solid var(--border-light)',
                        paddingBottom: '0.5rem',
                      }} {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: '600',
                        marginTop: '1.5rem',
                        marginBottom: '0.75rem',
                        color: 'var(--text-primary)',
                      }} {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: '600',
                        marginTop: '1rem',
                        marginBottom: '0.5rem',
                        color: 'var(--text-primary)',
                      }} {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p style={{
                        marginBottom: '1rem',
                        color: 'var(--text-primary)',
                      }} {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul style={{
                        marginBottom: '1rem',
                        paddingLeft: '1.5rem',
                        listStyleType: 'disc',
                        color: 'var(--text-primary)',
                      }} {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol style={{
                        marginBottom: '1rem',
                        paddingLeft: '1.5rem',
                        listStyleType: 'decimal',
                        color: 'var(--text-primary)',
                      }} {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li style={{
                        marginBottom: '0.25rem',
                        color: 'var(--text-primary)',
                      }} {...props} />
                    ),
                    code: ({ node, inline, ...props }: any) => (
                      inline ? (
                        <code style={{
                          backgroundColor: 'var(--bg-secondary)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.9em',
                          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                          color: 'var(--primary-500)',
                        }} {...props} />
                      ) : (
                        <code style={{
                          display: 'block',
                          backgroundColor: 'var(--bg-secondary)',
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.9em',
                          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                          color: 'var(--text-primary)',
                          overflowX: 'auto',
                          marginBottom: '1rem',
                        }} {...props} />
                      )
                    ),
                    pre: ({ node, ...props }) => (
                      <pre style={{
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        overflowX: 'auto',
                        marginBottom: '1rem',
                      }} {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote style={{
                        borderLeft: '4px solid var(--primary-500)',
                        paddingLeft: '1rem',
                        marginLeft: 0,
                        marginBottom: '1rem',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                      }} {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a style={{
                        color: 'var(--primary-500)',
                        textDecoration: 'underline',
                      }} {...props} />
                    ),
                    table: ({ node, ...props }) => (
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginBottom: '1rem',
                      }} {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th style={{
                        border: '1px solid var(--border-light)',
                        padding: '0.5rem',
                        backgroundColor: 'var(--bg-secondary)',
                        fontWeight: '600',
                        textAlign: 'left',
                      }} {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td style={{
                        border: '1px solid var(--border-light)',
                        padding: '0.5rem',
                      }} {...props} />
                    ),
                  }}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <div style={{
                color: 'var(--text-tertiary)',
                fontStyle: 'italic',
                textAlign: 'center',
                paddingTop: '4rem',
              }}>
                Nothing to preview. Start writing in the "Write" tab!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Markdown Help */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-tertiary)',
      }}>
        <strong>Markdown tips:</strong> **bold** • *italic* • `code` • # Heading • - List • [Link](url) • ```code block```
      </div>
    </div>
  );
}
