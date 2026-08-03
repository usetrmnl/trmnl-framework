# frozen_string_literal: true

require 'rails_helper'
require 'digest'

# The docs chrome is Tailwind, and a host mounting the engine cannot rebuild it: the
# input scans the gem's own views and pulls npm plugins. So the one copy a packaged gem
# can serve is the snapshot committed at app/assets/static/docs_chrome.css, and its
# input is scanned from those views and helpers, which means an ordinary docs edit moves
# it. This is the check that says the committed copy still matches its source:
# `rake framework:docs_chrome` refreshes it, `framework:release:build` runs that task,
# and a docs edit that skips both fails here instead of surfacing as an unexplained diff
# inside the next release commit. Same contract as the v1.2 bundle's snapshot next door.
RSpec.describe 'the packaged docs chrome' do
  subject(:snapshot) { Framework::Engine.root.join('app/assets/static/docs_chrome.css') }

  let(:built) { Rails.root.join(FrameworkBuild::TAILWIND_OUTPUT) }
  # One `/*! ... */` line the task writes ahead of the compiler output.
  let(:snapshot_body) { snapshot.read.split("\n", 2).last }

  before(:all) { FrameworkBuild.tailwind! }

  it 'carries the bytes the current sources compile to' do
    expect(Digest::SHA256.hexdigest(snapshot_body)).to eq(Digest::SHA256.file(built.to_s).hexdigest),
                                                       'app/assets/static/docs_chrome.css is stale. Run bin/rails framework:docs_chrome.'
  end
end
