# Slim multi-stage dev image (~150MB vs ~900MB for ruby:bookworm).
# Compilers stay in the deps stage; the running container only needs Node + Ruby.
# Plain RUN steps (no BuildKit cache mounts) for legacy docker-compose without buildx.
FROM ruby:4.0.6-slim-bookworm AS base

ENV BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_JOBS=4 \
    BUNDLE_RETRY=3

# Node comes from the .nvmrc pin, which is the single source of truth every other pin
# follows (package.json engines, the setup-node steps in the workflows). The nodesource
# setup_24.x line this replaces installed whatever 24.x was current at image build time,
# so the one toolchain RELEASE.md calls pinned was not. Installed in base, so the deps
# and dev stages inherit the same version instead of resolving one each.
COPY .nvmrc /tmp/nvmrc

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl ca-certificates xz-utils && \
    node_version="$(tr -d '[:space:]' < /tmp/nvmrc)" && \
    case "$(dpkg --print-architecture)" in \
      amd64) node_arch=x64 ;; \
      arm64) node_arch=arm64 ;; \
      *) echo "unsupported architecture: $(dpkg --print-architecture)" >&2; exit 1 ;; \
    esac && \
    curl -fsSL "https://nodejs.org/dist/v${node_version}/node-v${node_version}-linux-${node_arch}.tar.xz" \
      | tar -xJ -C /usr/local --strip-components=1 --no-same-owner \
        --exclude=CHANGELOG.md --exclude=LICENSE --exclude=README.md && \
    rm /tmp/nvmrc && \
    rm -rf /var/lib/apt/lists/* && \
    node --version && npm --version

FROM base AS deps

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile Gemfile.lock .ruby-version trmnl-framework.gemspec package.json package-lock.json ./
COPY lib/trmnl/framework/version.rb lib/trmnl/framework/version.rb

RUN gem install bundler -v "$(awk '/^BUNDLED WITH/{getline; gsub(/ /, ""); print}' Gemfile.lock)" --no-document

RUN bundle install

RUN npm ci --silent

FROM base AS dev

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y git && \
    gem install foreman --no-document && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /usr/local/bundle /usr/local/bundle
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

# Outside /app so bind mounts cannot hide the bootstrap script.
COPY bin/docker-entrypoint /usr/local/bin/trmnl-docker-entrypoint
RUN chmod +x /usr/local/bin/trmnl-docker-entrypoint

EXPOSE 3001

ENTRYPOINT ["trmnl-docker-entrypoint"]
CMD ["bin/dev"]
