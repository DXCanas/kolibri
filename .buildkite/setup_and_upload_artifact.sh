#!/usr/bin/env bash

set -euo pipefail

# Download all build installers here
buildkite-agent artifact download 'dist/*'
buildkite-agent artifact download 'installer/*.exe'

trap "rm upload_artifacts.iid" err exit

docker build \
  -f docker/upload_artifacts.dockerfile \
  --iidfile upload_artifacts.iid \
  -t "learningequality/upload-release-artifacts"
  .

docker run --rm \
  -v $PWD/dist:/dist \
  -v $GOOGLE_APPLICATION_CREDENTIALS:$GOOGLE_APPLICATION_CREDENTIALS \
  -e GOOGLE_APPLICATION_CREDENTIALS \
  -e GITHUB_ACCESS_TOKEN \
  -e BUILDKITE_TAG \
  $(more upload_artifacts.iid)
