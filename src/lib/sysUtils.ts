import os from 'os';
import path from 'path';

export function getNanobotDir() {
  return path.join(os.homedir(), '.nanobot');
}

export function getConfigPath() {
  return path.join(getNanobotDir(), 'config.json');
}

export function stripAnsi(str: string) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}
