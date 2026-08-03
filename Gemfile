source "https://rubygems.org"

ruby file: ".ruby-version"

# Engine gem + its runtime dependencies (see trmnl_framework.gemspec).
gemspec

# Released CSS is committed byte-for-byte, so the compiler this repo builds with is
# pinned exactly. Dart Sass 1.94+ splices custom-property text verbatim instead of
# re-quoting; the two affected source sites now use double quotes, and 1.93.3 and
# 1.101.0 compile the release bundles byte-identically. Bump the pin only with a fresh
# artifact-parity check, or a deliberate re-cut.
#
# The gemspec keeps the wider "~> 1.93" range on purpose, and that is not a weaker
# version of this pin: byte-parity binds the artifacts committed in this repo, which are
# built here with the exact pin, not a host's own compile of the Sass sources. The two
# versions checked against those artifacts agree, so a host resolving anywhere in the
# range is not a parity risk.
gem "sass-embedded", "1.93.3"

# Docs server / local host extras.
gem "puma"

# Build-only tooling: the release and fonts pipelines (cogger, rubyzip), the Markdown
# docs generator (nokogiri, reverse_markdown), and the docs-chrome Tailwind build.
# Deliberately out of the gemspec runtime list so mounting the engine installs none of
# them; every use site requires its gem lazily, and tailwindcss-rails is loaded here so
# `tailwindcss:build` exists for the docs server and the specs. nokogiri is listed
# because the Markdown task calls it directly: actionview's own dependencies happen to
# install it, and leaning on that made a direct use look like no dependency at all.
group :development, :test do
  # Pinned exactly for the same reason the gzip writer runs through Ruby's zlib: the .br
  # siblings are committed artifacts a rebuild-from-tag has to reproduce byte for byte, and
  # the compressed bytes are a property of the bundled brotli library version. Release
  # tooling only: serving a .br file needs no decoder, so the gemspec stays untouched and a
  # host that mounts the engine installs nothing.
  gem "brotli", "0.8.0", require: false
  gem "cogger", "~> 1.5", require: false
  gem "nokogiri", require: false
  gem "reverse_markdown", "~> 3.0", require: false
  gem "rubyzip", "~> 2.4.1", require: false
  gem "tailwindcss-rails", "~> 4.4"
end

group :development do
  gem "web-console"
end

group :development, :test do
  gem "rspec-rails", "~> 8.0"
  gem "rubocop", require: false
  gem "rubocop-rails", require: false
  gem "rubocop-rspec", require: false
end
