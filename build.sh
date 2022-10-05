#! /bin/bash

REGISTRY=registry.louispre.com:443

# I use the most recent commit shared between my branch and master as tag for the images
MOST_RECENT_ANCESTOR=$(git merge-base master $(git branch --show-current))

docker build -f louis/Dockerfile.python -t ${REGISTRY}/newsblur_python -t ${REGISTRY}/newsblur_python:$MOST_RECENT_ANCESTOR .
docker build -f louis/Dockerfile.node -t ${REGISTRY}/newsblur_node -t ${REGISTRY}/newsblur_node:$MOST_RECENT_ANCESTOR .
docker build -f louis/Dockerfile.redis -t ${REGISTRY}/newsblur_redis -t ${REGISTRY}/newsblur_redis:$MOST_RECENT_ANCESTOR .
docker build -f louis/Dockerfile.nginx -t ${REGISTRY}/newsblur_nginx -t ${REGISTRY}/newsblur_nginx:$MOST_RECENT_ANCESTOR .
docker build -f louis/Dockerfile.elasticsearch -t ${REGISTRY}/newsblur_elasticsearch -t ${REGISTRY}/newsblur_elasticsearch:$MOST_RECENT_ANCESTOR .
docker build -f louis/Dockerfile.haproxy -t ${REGISTRY}/newsblur_haproxy -t ${REGISTRY}/newsblur_haproxy:$MOST_RECENT_ANCESTOR .

docker push --all-tags ${REGISTRY}/newsblur_python
docker push --all-tags ${REGISTRY}/newsblur_node
docker push --all-tags ${REGISTRY}/newsblur_redis
docker push --all-tags ${REGISTRY}/newsblur_nginx
docker push --all-tags ${REGISTRY}/newsblur_elasticsearch
docker push --all-tags ${REGISTRY}/newsblur_haproxy