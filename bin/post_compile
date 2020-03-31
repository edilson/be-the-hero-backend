#!/usr/bin/env bash

if [ -n "$AUTO_MIGRATE" ] && [ "$AUTO_MIGRATE" == 1 ]; then
    echo "-----> Running migrations"
    npx knex migrate:latest
    echo "-----> Migrations made successfully"
fi
