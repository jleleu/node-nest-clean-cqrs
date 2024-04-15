import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
} from 'testcontainers';
import * as path from 'path';

let instance: StartedDockerComposeEnvironment | null = null;

export const startDocker = async () => {
  const composeFilePath = path.resolve(__dirname);
  const compileFile = 'docker-compose.yml';

  instance = await new DockerComposeEnvironment(
    composeFilePath,
    compileFile,
  ).up();
};

export const stopDocker = async () => {
  if (!instance) return;

  try {
    await instance.down();
    instance = null;
  } catch (e) {
    console.error('Failed to stop Docker:', e);
  }
};

export const getDockerEnvironment = (): StartedDockerComposeEnvironment => {
  if (!instance) throw new Error('Docker environment not started');
  return instance;
};
