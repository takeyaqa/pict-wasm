#!/usr/bin/env bash

set -eu

export EMSDK_DIR=/usr/local/emsdk
export EMSDK_VERSION=4.0.20

if [ ! -d "${EMSDK_DIR}" ]; then
    echo "Creating ${EMSDK_DIR} directory"
    sudo mkdir -p "${EMSDK_DIR}"

    echo "Cloning the emsdk"
    sudo git clone "https://github.com/emscripten-core/emsdk.git" "${EMSDK_DIR}"

    echo "Installing EMSDK ${EMSDK_VERSION}"
    sudo ${EMSDK_DIR}/emsdk install ${EMSDK_VERSION}

    echo "Activating EMSDK ${EMSDK_VERSION}"
    sudo ${EMSDK_DIR}/emsdk activate ${EMSDK_VERSION}

    echo "Workaround: Installing npm devDependencies for emscripten"
    cd ${EMSDK_DIR}/upstream/emscripten && npm ci
fi
