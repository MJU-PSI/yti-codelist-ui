#!/bin/bash
#
#
docker build -f Dockerfile.local -t yti-codelist-ui . --build-arg NPMRC
