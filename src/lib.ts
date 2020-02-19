import * as exec from '@actions/exec'

export interface Logger {
    debug: (message: string) => void
    info: (message: string) => void
    warning: (message: string) => void
    error: (message: string) => void
}

const devNull = (m: string) => {}

export const nullLogger: Logger = {
    debug: devNull,
    info: devNull,
    warning: devNull,
    error: devNull,
}

export interface ProcessOutput {
    stdout: string
    stderr: string
}

export async function invoke(
    cmd: string,
    params: string[],
    logger: Logger = nullLogger
): Promise<ProcessOutput> {
    const output: ProcessOutput = { stdout: '', stderr: '' }
    const opts = {
        listeners: {
            stdout: (data: Buffer) => {
                const msg = data.toString()
                logger.debug(`git: ${msg}`)
                output.stdout += msg
            },
            stderr: (data: Buffer) => {
                const msg = data.toString()
                logger.warning(`git: ${msg}`)
                output.stderr += msg
            }
        }
    }

    await exec.exec(cmd, params, opts)
    return output
}
