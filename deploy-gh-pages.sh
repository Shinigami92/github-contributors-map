#!/usr/bin/env sh

# https://vitejs.dev/guide/static-deploy.html#github-pages

# abort on errors
set -e

# build
yarn build

# navigate into the build output directory
cd dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:Shinigami92/github-contributors-map.git master:gh-pages

cd -
