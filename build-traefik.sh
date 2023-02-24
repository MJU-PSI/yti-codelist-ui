#!/bin/bash
#
#
docker build -f Dockerfile.traefik -t yti-codelist-ui . --build-arg NPMRC
