import { generateMCSequence } from './ai';

self.onmessage = (message) => {
  processMessage(message.data);
};

const processMessage = ({name, data}) => {
  if (name === 'generateMC') {
    let sequence = generateMCSequence(data);
    postMessage({sequence});
  }
};