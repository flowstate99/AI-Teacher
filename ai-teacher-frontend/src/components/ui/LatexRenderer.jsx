import { useEffect, useRef, useMemo } from 'react';
import katex from 'katex';

// Basic LaTeX styling
export const LaTeXStyles = `
.latex-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.latex-display {
  display: block;
  margin: 1em 0;
}
.latex-error {
  color: #cc0000;
  font-style: italic;
}
`;

// Utility to render LaTeX with error handling
const renderMath = (math, displayMode, options) => {
  try {
    return katex.renderToString(math, { ...options, displayMode });
  } catch (error) {
    console.warn('LaTeX render error:', error.message);
    return `<span class="latex-error" title="${error.message}">${math}</span>`;
  }
};

// Custom hook for LaTeX rendering
const useLaTeXRenderer = (content, options = {}) => {
  return useMemo(() => {
    if (!content) return '';

    const defaultOptions = {
      throwOnError: false,
      errorColor: '#cc0000',
      strict: 'warn',
      ...options
    };

    let processed = content;

    // Process $$...$$ (display math)
    processed = processed.replace(/\$\$(.*?)\$\$/gs, (_, math) =>
      `<div class="latex-display">${renderMath(math.trim(), true, defaultOptions)}</div>`
    );

    // Process \[...\] (display math)
    processed = processed.replace(/\\\[(.*?)\\\]/gs, (_, math) =>
      `<div class="latex-display">${renderMath(math.trim(), true, defaultOptions)}</div>`
    );

    // Process $...$ (inline math)
    processed = processed.replace(/\$(.+?)\$/g, (_, math) =>
      renderMath(math.trim(), false, defaultOptions)
    );

    // Process \( ... \) (inline math)
    processed = processed.replace(/\\\((.*?)\\\)/g, (_, math) =>
      renderMath(math.trim(), false, defaultOptions)
    );

    return processed;
  }, [content, JSON.stringify(options)]);
};

// Main LaTeX Renderer Component
const LatexRenderer = ({
  children,
  className = '',
  displayMode = false,
  inline = false,
  errorFallback = null
}) => {
  const contentRef = useRef(null);

  const renderedContent = useLaTeXRenderer(children, {
    displayMode: displayMode && !inline,
    throwOnError: false,
  });

  // Click-to-copy for math expressions
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const mathElements = el.querySelectorAll('.katex');
    mathElements.forEach(element => {
      element.style.cursor = 'pointer';
      element.title = 'Click to copy LaTeX';
      element.addEventListener('click', () => {
        const latex = element.textContent;
        navigator.clipboard?.writeText(latex).then(() => {
          const tooltip = document.createElement('div');
          tooltip.textContent = 'Copied!';
          tooltip.className = 'latex-tooltip';
          tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
          `;
          document.body.appendChild(tooltip);

          const rect = element.getBoundingClientRect();
          tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
          tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;

          setTimeout(() => {
            document.body.removeChild(tooltip);
          }, 1000);
        });
      });
    });

    return () => {
      mathElements.forEach(element => {
        element.removeEventListener('click', () => {});
      });
    };
  }, [renderedContent]);

  if (errorFallback && renderedContent.includes('latex-error')) {
    return errorFallback;
  }

  return (
    <div
      ref={contentRef}
      className={`latex-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
      style={{
        lineHeight: displayMode ? '1.6' : '1.4',
        fontSize: inline ? 'inherit' : '16px',
      }}
    />
  );
};

// Specialized components
export const InlineMath = ({ children, className = '' }) => (
  <LatexRenderer inline className={`inline-math ${className}`}>
    {children}
  </LatexRenderer>
);

export const DisplayMath = ({ children, className = '' }) => (
  <LatexRenderer displayMode className={`display-math ${className}`}>
    {children}
  </LatexRenderer>
);

export const MathBlock = ({ children, className = '', centered = true }) => (
  <div className={`math-block ${centered ? 'text-center' : ''} ${className}`}>
    <LatexRenderer displayMode>
      {children}
    </LatexRenderer>
  </div>
);

export const MixedContent = ({ children, className = '' }) => {
  const processedContent = useMemo(() => {
    if (typeof children !== 'string') return children;

    return children
      .split('\n\n')
      .map((paragraph, i) => (
        <div key={i} className="mb-4">
          <LatexRenderer className="leading-relaxed">{paragraph.trim()}</LatexRenderer>
        </div>
      ));
  }, [children]);

  return <div className={`mixed-content ${className}`}>{processedContent}</div>;
};

export default LatexRenderer;
