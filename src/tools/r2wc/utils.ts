export const loadScript = async (src: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      const error = new Error(`Failed to load script: ${src}`);
      reject(error);
    };

    script.type = 'module';
    script.src = src;

    document.head.appendChild(script);
  });
};

export const generateSVGSpriteDomElement = async (path: string) => {
  try {
    const response = await fetch(`${path}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.statusText}`);
    }
    const svgText = await response.text();

    // Parse the SVG text into a DOM element
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error('SVG parsing failed');
    }

    const svgElement = doc.documentElement;

    // Ensure all necessary namespaces are present
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgElement.removeAttribute('id');

    return svgElement;
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Intended debug output
    console.error('Error generating SVG sprite:', error);
    return null;
  }
};
