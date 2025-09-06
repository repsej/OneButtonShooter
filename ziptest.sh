#!/bin/bash

rm -rf docs/
mkdir docs/
cd docs/
cp ../dist/a.zip .
unzip a.zip
http-server
