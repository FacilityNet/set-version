import { Git, GitError } from '../src/git'
import {
    SemanticVersion,
    getVersionFromGit,
    withPullRequestInfo,
    stringify
} from '../src/version'
import { PullRequestEvent, PullRequestAction } from '../src/github'

describe('getVersionFromGit', () => {
    test('throws if git outputs fatal error message', async () => {
        const git: Git = {
            fetchTags: logger => Promise.resolve(''),
            describe: (glob, logger) =>
                Promise.reject(
                    new GitError(
                        'fatal: No names found, cannot describe anything.'
                    )
                )
        }
        await expect(getVersionFromGit(git)).rejects.toBeInstanceOf(GitError)
    })

    test('collects version info if git outputs exact match', async () => {
        const git: Git = {
            fetchTags: logger => Promise.resolve(''),
            describe: (glob, logger) => Promise.resolve('v2.5')
        }

        await expect(getVersionFromGit(git)).resolves.toEqual({
            major: '2',
            minor: '5',
            patch: '0',
            preRelease: '',
            buildMetadata: ''
        })
    })

    test('collects version info if git outputs inexact match', async () => {
        const git: Git = {
            fetchTags: logger => Promise.resolve(''),
            describe: (glob, logger) => Promise.resolve('v2.0-13-gdb82e9be')
        }

        await expect(getVersionFromGit(git)).resolves.toEqual({
            major: '2',
            minor: '0',
            patch: '13',
            preRelease: '',
            buildMetadata: 'gdb82e9be'
        })
    })

    test('handles tag without minor version', async () => {
        const git: Git = {
            fetchTags: logger => Promise.resolve(''),
            describe: (glob, logger) => Promise.resolve('v51-26-gdb82e9be')
        }

        await expect(getVersionFromGit(git)).resolves.toEqual({
            major: '51',
            minor: '0',
            patch: '26',
            preRelease: '',
            buildMetadata: 'gdb82e9be'
        })
    })

    test('handles tag with major version 0', async () => {
        const git: Git = {
            fetchTags: logger => Promise.resolve(''),
            describe: (glob, logger) => Promise.resolve('v0.1')
        }

        await expect(getVersionFromGit(git)).resolves.toEqual({
            major: '0',
            minor: '1',
            patch: '0',
            preRelease: '',
            buildMetadata: ''
        })
    })

    test('handles whitespace in git output', async () => {
        const git: Git = {
            fetchTags: logger => Promise.resolve(''),
            describe: (glob, logger) => Promise.resolve('v0.1\n')
        }

        await expect(getVersionFromGit(git)).resolves.toEqual({
            major: '0',
            minor: '1',
            patch: '0',
            preRelease: '',
            buildMetadata: ''
        })
    })
})

describe('withPullRequestInfo', () => {
    test('leaves version unchanged when no PR', () => {
        const version: SemanticVersion = {
            major: '2',
            minor: '1',
            patch: '5'
        }

        expect(withPullRequestInfo(version, undefined)).toEqual(version)
    })
    test('adds pre-release to version', () => {
        const version: SemanticVersion = {
            major: '2',
            minor: '1',
            patch: '5',
            buildMetadata: 'gdb82e9be'
        }

        const event: PullRequestEvent = {
            action: PullRequestAction.OPENED,
            number: 51
        }
        expect(withPullRequestInfo(version, event)).toEqual({
            major: '2',
            minor: '1',
            patch: '5',
            preRelease: 'pr51',
            buildMetadata: 'gdb82e9be'
        })
    })
})

describe('stringify', () => {
    test('can stringify with only major minor patch', () => {
        const version: SemanticVersion = {
            major: '2',
            minor: '1',
            patch: '5'
        }

        expect(stringify(version, true)).toEqual('2.1.5')
    })
    test('excludes metadata when asked to', () => {
        const version: SemanticVersion = {
            major: '2',
            minor: '1',
            patch: '5',
            buildMetadata: 'sjkdhksdjka'
        }

        expect(stringify(version, false)).toEqual('2.1.5')
    })
    test('does not append metadata for empty string', () => {
        const version: SemanticVersion = {
            major: '2',
            minor: '1',
            patch: '5',
            buildMetadata: ''
        }

        expect(stringify(version, true)).toEqual('2.1.5')
    })
    test('appends metadata correctly', () => {
        const version: SemanticVersion = {
            major: '2',
            minor: '1',
            patch: '5',
            buildMetadata: 'sjkdhksdjka'
        }

        expect(stringify(version, true)).toEqual('2.1.5+sjkdhksdjka')
    })
    test('does not append pre-release for empty string', () => {
        const version: SemanticVersion = {
            major: '2',
            minor: '1',
            patch: '5',
            preRelease: ''
        }

        expect(stringify(version, true)).toEqual('2.1.5')
    })
    test('appends prerelease correctly', () => {
        const version: SemanticVersion = {
            major: '2',
            minor: '1',
            patch: '5',
            preRelease: 'pr2348'
        }

        expect(stringify(version, true)).toEqual('2.1.5-pr2348')
    })
    test('appends prerelease and metadata correctly', () => {
        const version: SemanticVersion = {
            major: '2',
            minor: '1',
            patch: '5',
            preRelease: 'pr2348',
            buildMetadata: 'abbcaf'
        }

        expect(stringify(version, true)).toEqual('2.1.5-pr2348+abbcaf')
    })
    test('handles v0.1.0 correctly', () => {
        const version: SemanticVersion = {
            major: '0',
            minor: '1',
            patch: '0',
            preRelease: '',
            buildMetadata: ''
        }

        expect(stringify(version, false)).toEqual('0.1.0')
    })
})
