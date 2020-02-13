import * as exec from '@actions/exec'

interface ProcessOutput {
  stdout: string
  stderr: string
}

async function invoke(cmd: string, params: string[]): Promise<ProcessOutput> {
  const output: ProcessOutput = {stdout: '', stderr: ''}
  const opts = {
    listeners: {
      stdout: (data: Buffer) => (output.stdout += data.toString()),
      stderr: (data: Buffer) => (output.stderr += data.toString())
    }
  }

  await exec.exec(cmd, params, opts)
  return output
}

export interface Git {
  describe(glob: string): Promise<string>
}

export class GitError extends Error {
  constructor(message?: string) {
    super(message)
    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

const impl: Git = {
  async describe(glob) {
    const {stdout, stderr} = await invoke('git', ['describe', '--match', glob])
    if (stderr.startsWith('fatal')) throw new GitError(stderr)
    return stdout
  }
}

export default impl
