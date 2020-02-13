import { Git, GitError } from '../src/git'
import { getVersionFromGit } from '../src/version'

test('throws if git outputs fatal error message', async () => {
    const git: Git = {
        describe: (glob) => Promise.reject(new GitError('fatal: No names found, cannot describe anything.'))
    }
    await expect(getVersionFromGit(git)).rejects.toBeInstanceOf(GitError)
})

test('collects version info if git outputs exact match', () => {
    const git: Git = {
        describe: (glob) => Promise.resolve('v2.5')
    }

    return expect(getVersionFromGit(git)).resolves.toEqual({ major: "2", minor: "5", patch: "", preRelease: "", buildMetadata: "" })
})

test('collects version info if git outputs inexact match', () => {
    const git: Git = {
        describe: (glob) => Promise.resolve('v2.0-13-gdb82e9be')
    }

    return expect(getVersionFromGit(git)).resolves.toEqual({ major: "2", minor: "0", patch: "13", preRelease: "", buildMetadata: "gdb82e9be" })
})
