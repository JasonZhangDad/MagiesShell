#!/usr/bin/env bash
# Sync the latest MagiesTerminal GitHub Release assets onto the official mirror.
# Keeps only the newest release directory to save disk space.
set -euo pipefail

REPO="${GITHUB_REPO:-JasonZhangDad/MgTerminal}"
DEST_ROOT="${RELEASE_DEST:-/var/www/shell.magies.top/releases}"
PUBLIC_BASE="${MIRROR_PUBLIC_BASE:-https://shell.magies.top/releases}"
TMP_ROOT="${TMPDIR:-/tmp}/magies-release-sync.$$"
API_URL="https://api.github.com/repos/${REPO}/releases/latest"

export REPO

cleanup() {
  rm -rf "${TMP_ROOT}"
}
trap cleanup EXIT

mkdir -p "${DEST_ROOT}" "${TMP_ROOT}"

auth_args=(-H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28")
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  auth_args+=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
fi

echo "[sync] fetching latest release from ${REPO}"
release_json_file="${TMP_ROOT}/release.json"
curl -fsSL \
  "${auth_args[@]}" \
  "${API_URL}" > "${release_json_file}"

eval "$(python3 - "${release_json_file}" <<'PY'
import json, re, sys
path = sys.argv[1]
with open(path, encoding='utf-8') as fh:
    data = json.load(fh)
tag = data.get('tag_name') or ''
if not re.fullmatch(r'v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?', tag, re.I):
    raise SystemExit(f'invalid tag_name: {tag!r}')
print(f'tag={tag!r}')
print(f'version={tag.lstrip("vV")!r}')
PY
)"

version_dir="${DEST_ROOT}/${tag}"
current_tag=""
if [[ -f "${DEST_ROOT}/latest.json" ]]; then
  current_tag="$(python3 - "${DEST_ROOT}/latest.json" 2>/dev/null <<'PY' || true
import json, sys
with open(sys.argv[1], encoding='utf-8') as fh:
    print(json.load(fh).get('tag') or '')
PY
)"
fi
if [[ "${current_tag}" == "${tag}" && -d "${version_dir}" && -L "${DEST_ROOT}/latest" && "$(readlink "${DEST_ROOT}/latest")" == "${tag}" ]]; then
  echo "[sync] already synced: ${tag}"
  exit 0
fi

staging_dir="${TMP_ROOT}/${tag}"
mkdir -p "${staging_dir}"

mapfile -t assets < <(python3 - "${release_json_file}" <<'PY'
import json, sys
with open(sys.argv[1], encoding='utf-8') as fh:
    data = json.load(fh)
for asset in data.get('assets') or []:
    name = asset.get('name') or ''
    url = asset.get('browser_download_url') or ''
    if name and url and '/' not in name and '..' not in name:
        print(f'{name}\t{url}')
PY
)

if [[ "${#assets[@]}" -eq 0 ]]; then
  echo "[sync] release has no downloadable assets" >&2
  exit 1
fi

echo "[sync] downloading ${#assets[@]} assets for ${tag}"
downloaded_names=()
for row in "${assets[@]}"; do
  name="${row%%$'\t'*}"
  url="${row#*$'\t'}"
  if [[ -z "${name}" || "${name}" == *"/"* || "${name}" == *".."* ]]; then
    echo "[sync] refusing unsafe asset name: ${name}" >&2
    exit 1
  fi
  echo "[sync]   ${name}"
  curl -fL --retry 3 --retry-delay 2 -o "${staging_dir}/${name}" "${url}"
  downloaded_names+=("${name}")
done

synced_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
REPO="${REPO}" TAG="${tag}" VERSION="${version}" SYNCED_AT="${synced_at}" \
python3 - "${staging_dir}/latest.json" "${downloaded_names[@]}" <<'PY'
import json, os, sys
out_path = sys.argv[1]
names = sys.argv[2:]
repo = os.environ['REPO']
tag = os.environ['TAG']
version = os.environ['VERSION']
assets = [
    {
        'name': name,
        'browser_download_url': f'https://github.com/{repo}/releases/download/{tag}/{name}',
    }
    for name in names
]
manifest = {
    'tag': tag,
    'version': version,
    'syncedAt': os.environ['SYNCED_AT'],
    'assets': assets,
}
with open(out_path, 'w', encoding='utf-8') as fh:
    json.dump(manifest, fh, ensure_ascii=False, indent=2)
    fh.write('\n')
PY

# Promote the versioned directory, then point the stable "latest" path at it.
rm -rf "${version_dir}"
mv "${staging_dir}" "${version_dir}"

latest_staging="${TMP_ROOT}/latest-new"
ln -s "${tag}" "${latest_staging}"
rm -rf "${DEST_ROOT}/latest"
mv "${latest_staging}" "${DEST_ROOT}/latest"
cp -f "${version_dir}/latest.json" "${DEST_ROOT}/latest.json"

# Keep only the current release directory (+ latest/ + latest.json).
shopt -s nullglob
for dir in "${DEST_ROOT}"/v*; do
  base="$(basename "${dir}")"
  if [[ -d "${dir}" && "${base}" != "${tag}" ]]; then
    echo "[sync] removing old release ${base}"
    rm -rf "${dir}"
  fi
done

echo "[sync] done: ${PUBLIC_BASE}/latest.json -> ${tag}"
ls -lh "${DEST_ROOT}/latest"
