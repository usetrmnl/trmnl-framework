# frozen_string_literal: true

require 'rails_helper'
require 'digest'

# plugins_legacy.css is compiled by every build path and published by none, so the one
# copy a packaged gem can serve is the snapshot committed at app/assets/static/
# legacy_bundle.css. A committed build artifact is only worth anything while it matches
# its source, and this is the check that says so: `rake framework:legacy_bundle` refreshes
# it, `framework:release:build` runs that task, and an edit to plugins_legacy.scss that
# skips both fails here.
RSpec.describe 'the packaged v1.2 bundle' do
  subject(:snapshot) { Framework::Engine.root.join('app/assets/static/legacy_bundle.css') }

  let(:built) { Rails.root.join('app/assets/builds/plugins_legacy.css') }
  # One `/*! ... */` line the task writes ahead of the compiler output.
  let(:snapshot_body) { snapshot.read.split("\n", 2).last }

  before(:all) { FrameworkBuild.sass! }

  it 'carries the bytes the current sources compile to' do
    expect(Digest::SHA256.hexdigest(snapshot_body)).to eq(Digest::SHA256.file(built.to_s).hexdigest),
                                                       'app/assets/static/legacy_bundle.css is stale. Run bin/rails framework:legacy_bundle.'
  end
end
