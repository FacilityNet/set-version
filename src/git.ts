import { Logger, nullLogger, invoke } from './lib'

export interface Git {
    fetchTags(logger: Logger): Promise<string>
    describe(glob: string, logger: Logger): Promise<string>
}

export class GitError extends Error {
    constructor(message?: string) {
        super(message)
        // Restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

const impl: Git = {
    async fetchTags(logger: Logger = nullLogger) {
        const { stdout, stderr } = await invoke(
            'git',
            ['fetch', '--tags'],
            logger
        )
        if (stderr.startsWith('fatal')) throw new GitError(stderr)
        return stdout
    },
    async describe(glob: string, logger: Logger = nullLogger) {
        const { stdout, stderr } = await invoke(
            'git',
            ['describe', '--match', `"${glob}"`],
            logger
        )
        if (stderr.startsWith('fatal')) throw new GitError(stderr)
        return stdout
    }
}

export default impl
