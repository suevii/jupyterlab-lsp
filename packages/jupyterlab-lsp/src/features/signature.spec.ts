import { expect } from 'chai';

import { BrowserConsole } from '../virtual/console';

import { extractLead, signatureToMarkdown } from './signature';

describe('Signature', () => {
  describe('extractLead', () => {
    it('Extracts standalone one-line paragraph', () => {
      const split = extractLead(
        ['This function does foo', '', 'But there are more details'],
        1
      )!;
      expect(split.lead).to.equal('This function does foo');
      expect(split.remainder).to.equal('But there are more details');
    });
    it('Does not extracts when it would break markdown', () => {
      let split = extractLead(
        ['This is **not the end', '', 'of this spread sentence**'],
        1
      );
      expect(split).to.equal(null);

      split = extractLead(
        ['This is <b>not the end', '', 'of this spread sentence</b>'],
        1
      );
      expect(split).to.equal(null);
    });
    it('Extracts standalone two-line paragraph', () => {
      const split = extractLead(
        [
          'This function does foo,',
          'and it does bar',
          '',
          'But there are more details'
        ],
        2
      )!;
      expect(split.lead).to.equal('This function does foo,\nand it does bar');
      expect(split.remainder).to.equal('But there are more details');
    });
    it('Does not extract too long paragraph', () => {
      const split = extractLead(
        [
          'This function does foo,',
          'and it does bar',
          '',
          'But there are more details'
        ],
        1
      );
      expect(split).to.equal(null);
    });
  });

  describe('SignatureToMarkdown', () => {
    const MockHighlighter = (code: string, fragment: string) =>
      code.replace(fragment, `<u>${fragment}</u>`);

    it('renders plaintext signature', async () => {
      let text = signatureToMarkdown(
        {
          label: 'str(text)',
          documentation: 'Create a new *string* object from the given object.',
          parameters: [
            {
              label: 'text',
              documentation: undefined
            }
          ],
          activeParameter: 0
        },
        'python',
        MockHighlighter,
        new BrowserConsole()
      );
      expect(text).to.be.equal(
        'str(<u>text</u>)\n\nCreate a new \\*string\\* object from the given object.\n'
      );
    });

    it('renders plaintext signature with MarkupContent documentation', async () => {
      let text = signatureToMarkdown(
        {
          label: 'str(text)',
          documentation: {
            value: 'Create a new *string* object from the given object.',
            kind: 'plaintext'
          },
          parameters: [
            {
              label: 'text',
              documentation: undefined
            }
          ],
          activeParameter: 0
        },
        'python',
        MockHighlighter,
        new BrowserConsole()
      );
      expect(text).to.be.equal(
        'str(<u>text</u>)\n\nCreate a new \\*string\\* object from the given object.\n'
      );
    });

    it('renders Markdown signature', async () => {
      let text = signatureToMarkdown(
        {
          label: 'str(text)',
          documentation: {
            value: 'Create a new *string* object from the given object.',
            kind: 'markdown'
          },
          parameters: [
            {
              label: 'text',
              documentation: undefined
            }
          ],
          activeParameter: 0
        },
        'python',
        MockHighlighter,
        new BrowserConsole()
      );
      expect(text).to.be.equal(
        'str(<u>text</u>)\n\nCreate a new *string* object from the given object.'
      );
    });

    it('renders plaintext with details and paramaters', async () => {
      let text = signatureToMarkdown(
        {
          label: 'str(text)',
          documentation: {
            value: 'line 1\n\nline 2\nline 3\nline 4\nline 5',
            kind: 'plaintext'
          },
          parameters: [
            {
              label: 'text',
              documentation: undefined
            }
          ],
          activeParameter: 0
        },
        'python',
        MockHighlighter,
        new BrowserConsole(),
        undefined,
        4
      );
      expect(text).to.be.equal(
        'str(<u>text</u>)\n\nline 1\n<details>\nline 2\nline 3\nline 4\nline 5\n</details>'
      );
    });

    it('renders plaintext with details and no parameters', async () => {
      let text = signatureToMarkdown(
        {
          label: 'str()',
          documentation: {
            value: 'line 1\n\nline 2\nline 3\nline 4\nline 5',
            kind: 'plaintext'
          }
        },
        'python',
        MockHighlighter,
        new BrowserConsole(),
        undefined,
        4
      );
      expect(text).to.be.equal(
        '```python\nstr()\n```\n\nline 1\n<details>\nline 2\nline 3\nline 4\nline 5\n</details>'
      );
    });
  });
});
