#!/bin/bash
yarn run prepublish
rsync -rvIz --rsh=ssh --delete --exclude=.git --exclude=*.blend ./lib/ ~/ideaprojects/ea-modern/node_modules/domainql-form/lib
