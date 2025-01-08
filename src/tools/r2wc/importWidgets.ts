import { busDispatch } from '../eventBus';

import { loadScript } from './utils';

export const importWidgets = async (jsFiles: string[]) => {
  const uniqueFiles = jsFiles.filter((file) => {
    return file?.length && !document.querySelector(`script[src="${file}"]`);
  });

  const results = await Promise.allSettled(uniqueFiles.map((file) => loadScript(file)));

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      // biome-ignore lint/suspicious/noConsole: Intended debug output
      console.error(
        `Failed to load widget script ${uniqueFiles[index]}:`,
        result.reason,
      );
    }
  });

  busDispatch('@@-widgets-loaded', true);
};
