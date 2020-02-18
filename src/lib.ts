import * as exec from "@actions/exec"

export type Logger = (message: string) => void

export const nullLogger: Logger = (message) => {}

export interface ProcessOutput {
    stdout: string
    stderr: string
}

export async function invoke(cmd: string, params: string[], logger: Logger = nullLogger): Promise<ProcessOutput> {
    const output: ProcessOutput = {stdout: '', stderr: ''}
    const logAndAppend = (target: string) => (data: Buffer) => {
        const msg = data.toString()
        logger('git: ' + msg)
        target += msg
    }
    const opts = {
        listeners: {
            stdout: logAndAppend(output.stdout),
            stderr: logAndAppend(output.stderr)
        }
    }

    await exec.exec(cmd, params, opts)
    return output
}
