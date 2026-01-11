#!/usr/bin/env bash

set -eu

export EMSDK_DIR=.emsdk
export EMSDK_VERSION="$(tr -d '\n' < .emsdk_version)"

if [ ! -d "${EMSDK_DIR}" ]; then
    echo "Creating ${EMSDK_DIR} directory"
    mkdir -p "${EMSDK_DIR}"

    echo "Cloning the emsdk"
    git clone "https://github.com/emscripten-core/emsdk.git" "${EMSDK_DIR}"

    echo "Installing EMSDK ${EMSDK_VERSION}"
    ${EMSDK_DIR}/emsdk install ${EMSDK_VERSION}

    echo "Activating EMSDK ${EMSDK_VERSION}"
    ${EMSDK_DIR}/emsdk activate ${EMSDK_VERSION}

    echo "Workaround: Installing npm devDependencies for emscripten"
    cd ${EMSDK_DIR}/upstream/emscripten && npm ci
    cd -

    echo "EMSDK installation complete"
    echo "Run 'source ${EMSDK_DIR}/emsdk_env.sh' to set up the environment"
fi
