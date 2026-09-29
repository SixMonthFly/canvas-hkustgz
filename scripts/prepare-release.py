"""Enable each platform only after its reviewed public asset is verified."""
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

FIELDS = ('version', 'tag', 'available', 'filename', 'url', 'size', 'sha256')


def resolve_packages(release, repository, token):
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', repository):
        raise ValueError('Invalid repository')
    packages = release.get('packages')
    if packages is None:
        packages = {'mac': {field: release.get(field) for field in FIELDS}}
    if not isinstance(packages, dict) or 'mac' not in packages or set(packages) - {'mac', 'windows'}:
        raise ValueError('Invalid platform metadata')
    releases = {}
    for platform, package in packages.items():
        version = package['version']
        tag = package['tag']
        filename = package['filename']
        expected_name = (f'CanvasManager-{version}-mac-arm64.dmg' if platform == 'mac'
                         else f'CanvasManager-Setup-{version}-x64.exe')
        if (not re.fullmatch(r'[0-9]+\.[0-9]+\.[0-9]+', version)
                or tag != f'v{version}' or filename != expected_name
                or not re.fullmatch(r'[a-f0-9]{64}', package['sha256'])
                or type(package['size']) is not int or package['size'] <= 0):
            raise ValueError(f'Invalid {platform} package metadata')
        package['available'] = False
        package['url'] = f'https://github.com/{repository}/releases/download/{tag}/{filename}'
        if tag not in releases:
            request = urllib.request.Request(
                f'https://api.github.com/repos/{repository}/releases/tags/{urllib.parse.quote(tag, safe="")}',
                headers={'Accept': 'application/vnd.github+json',
                         'X-GitHub-Api-Version': '2022-11-28',
                         'Authorization': 'Bearer ' + token})
            try:
                with urllib.request.urlopen(request, timeout=30) as response:
                    releases[tag] = json.load(response)
            except urllib.error.HTTPError as error:
                if error.code != 404:
                    raise
                releases[tag] = None
        remote = releases[tag]
        if not remote or remote.get('draft') or remote.get('prerelease'):
            continue
        asset = next((item for item in remote.get('assets', []) if item['name'] == filename), None)
        if not asset or asset['size'] != package['size'] or not asset.get('digest'):
            continue
        if asset['digest'] != 'sha256:' + package['sha256']:
            raise ValueError(f'Published {platform} package SHA-256 differs from the reviewed package.')
        if asset['browser_download_url'] != package['url']:
            raise ValueError(f'Unexpected {platform} package download URL.')
        package['available'] = True
        print(f'{platform}: published package verified; download enabled.')
    release['packages'] = packages
    release['schemaVersion'] = 2
    # Keep the flat Mac fields compatible with previously cached site.js.
    release.update({field: packages['mac'][field] for field in FIELDS})
    return release


def main():
    metadata = Path('site/release.json')
    release = resolve_packages(json.loads(metadata.read_text()),
                               os.environ['RELEASE_REPOSITORY'], os.environ['GH_TOKEN'])
    metadata.write_text(json.dumps(release, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
