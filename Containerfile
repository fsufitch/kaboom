### Bazel and friends build stage
FROM docker.io/golang:1.25 AS bazeltools

RUN go install github.com/bazelbuild/bazelisk@latest
RUN go install github.com/bazelbuild/buildtools/buildifier@latest
RUN go install github.com/bazelbuild/buildtools/buildozer@latest

# To use these, copy them from /go/bin/ in subsequent stages, into /usr/local/bin/ or another directory in PATH.

### Buildifier build stage
FROM docker.io/fedora:43 AS buildifier
ARG BUILDIFIER_TAG=v8.2.1

### Devcontainer build stage
FROM docker.io/fedora:43 AS devcontainer

# Install bazelisk and other tools
COPY --from=bazeltools /go/bin/bazelisk /usr/local/bin/bazelisk
RUN chmod +x /usr/local/bin/bazelisk && \
    ln -s /usr/local/bin/bazelisk /usr/local/bin/bazel
COPY --from=bazeltools /go/bin/buildifier /usr/local/bin/buildifier
COPY --from=bazeltools /go/bin/buildozer /usr/local/bin/buildozer

# Generate bash completion for bazelisk
COPY ./.bazelversion /tmp/.bazelversion
RUN USE_BAZEL_VERSION=$(cat /tmp/.bazelversion) bazelisk completion bash > /etc/bash_completion.d/bazel.sh

# Install common devcontainer packages
RUN dnf install -y \
    bash-completion \
    clang \
    clang-tools-extra \
    curl \
    file \
    gcc-c++ \
    git \
    gnupg2 \
    hostname \
    iputils \
    jq \
    man-db \
    ncurses \
    openssh \
    openssh-clients \
    protobuf-compiler \
    python3 \
    sudo \
    unzip \
    vim \
    wget \
    xz \
    zip


# Extra bashrc, paths, etc
COPY ./.devcontainer/bashrc-load-dir.sh /etc/bashrc-load-dir.sh
COPY ./.devcontainer/bashrc.d /etc/.bashrc.d
RUN printf '\n\
    if [ -d /etc/.bashrc.d ]; then\n\
    for rc in /etc/.bashrc.d/*; do\n\
    if [ -f "$rc" ]; then\n\
    . "$rc"\n\
    fi\n\
    done\n\
    fi\n\
    \n' >> /etc/bashrc


# Build arg from devcontainer.json
ARG USERNAME=developer
ARG USER_UID=1000
ARG USER_GID=${USER_UID}


# Create the user with that name
RUN groupadd --gid ${USER_GID} ${USERNAME} \
    && useradd --uid ${USER_UID} --gid ${USER_GID} -m ${USERNAME} \
    && echo "${USERNAME} ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/${USERNAME} \
    && chmod 0440 /etc/sudoers.d/${USERNAME}

USER ${USERNAME}
WORKDIR /workspace
