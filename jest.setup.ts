import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'fast-text-encoding';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
