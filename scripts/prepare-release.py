"""Enable the download only when the expected public Release asset exists."""
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

metadata = Path('site/release.json')
release = json.loads(metadata.read_text())
repository = os.environ['RELEASE_REPOSITORY']
if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', repository):
    raise ValueError('Invalid repository')
tag = release['tag']
filename = release['filename']
if not re.fullmatch(r'v[0-9]+\.[0-9]+\.[0-9]+', tag):
    raise ValueError('Invalid version tag')
release['available'] = False
release['url'] = f'https://github.com/{repository}/releases/download/{tag}/{filename}'
request = urllib.request.Request(
    f'https://api.github.com/repos/{repository}/releases/tags/{urllib.parse.quote(tag, safe="")}',
    headers={'Accept': 'application/vnd.github+json',
             'X-GitHub-Api-Version': '2022-11-28',
             'Authorization': 'Bearer ' + os.environ['GH_TOKEN']})
try:
    with urllib.request.urlopen(request, timeout=30) as response:
        remote = json.load(response)
except urllib.error.HTTPError as error:
    if error.code != 404:
        raise
    print('Release not published yet; download remains unavailable.')
else:
    if not remote.get('draft') and not remote.get('prerelease'):
        asset = next((item for item in remote.get('assets', []) if item['name'] == filename), None)
        if asset and asset['size'] == release['size']:
            digest = asset.get('digest')
            if digest and digest != 'sha256:' + release['sha256']:
                raise ValueError('Published package SHA-256 differs from the reviewed package.')
            release['url'] = asset['browser_download_url']
            release['available'] = True
            print('Published package found; download enabled.')
metadata.write_text(json.dumps(release, ensure_ascii=False, indent=2) + '\n')
