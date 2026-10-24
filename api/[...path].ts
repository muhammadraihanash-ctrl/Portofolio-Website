import type { IncomingMessage, ServerResponse } from 'http';
import handler from './index';

export default async function catchAllHandler(req: IncomingMessage, res: ServerResponse) {
  return handler(req, res);
}
