# frozen_string_literal: true

require 'rails_helper'

# Both Playwright suites boot their own Rails server, and each one has to boot it on a
# port nothing else in the repo claims. The runtime suite used to default to 3001, the
# port bin/dev listens on, with `reuseExistingServer: true`: the documented loop is
# bin/dev in one terminal and the suite in another, so the suite adopted the dev server
# and skipped the dartsass and tailwind builds its webServer command runs first.
#
# The same flag hard-coded to true also means CI adopts a server left behind by an
# earlier step instead of failing, so both configs gate it on the CI env var now.
RSpec.describe 'Playwright web servers' do
  root = Framework::Engine.root

  configs = {
    'runtime' => File.read(root.join('test/runtime/playwright.config.js')),
    'visual' => File.read(root.join('test/visual/playwright.config.js'))
  }.freeze

  # The literal each config falls back to when its port env var is unset.
  default_ports = configs.transform_values do |source|
    source[/const port = Number\(process\.env\.\w+ \|\| (\d+)\)/, 1].to_i
  end

  # bin/dev exports PORT and Procfile.dev hands it to the server, so the fallback in
  # bin/dev is the port a contributor following CONTRIBUTING has listening.
  dev_port = File.read(root.join('bin/dev'))[/^export PORT="\$\{PORT:-(\d+)\}"/, 1].to_i

  it 'reads a default port out of both configs and out of bin/dev' do
    aggregate_failures do
      expect(default_ports.values).to all(be_positive)
      expect(dev_port).to be_positive
    end
  end

  configs.each_key do |suite|
    it "keeps the #{suite} suite off the port bin/dev listens on" do
      expect(default_ports.fetch(suite)).not_to eq(dev_port)
    end
  end

  it 'gives the two suites different ports' do
    expect(default_ports.values.uniq.size).to eq(default_ports.size)
  end
end
