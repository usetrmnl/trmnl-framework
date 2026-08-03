# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Framework scaled typography' do
  subject(:css) { FrameworkBuild.plugins_css }

  scaled_modifier_classes =
    %w[xxsmall xsmall small large xlarge xxlarge].map { |id| "screen--scale-#{id}" } +
    (Framework::TextScale.ids - ['regular']).map { |id| "screen--text-scale-#{id}" }

  scaled_modifier_classes.each do |modifier_class|
    it "forces vector typography under #{modifier_class}" do
      expect(css).to match(/\.#{modifier_class}[^{]*\{[^}]*--font-small-font-family:\s*"Inter Variable",\s*Inter/)
    end
  end

  it 'keeps the active bundle sizes under scale modifiers' do
    expect(css).not_to match(/\.screen--text-scale-xlarge[^{]*\{[^}]*font-size/)
  end

  it 'keeps the active bundle line heights under scale modifiers' do
    expect(css).not_to match(/\.screen--text-scale-xlarge[^{]*\{[^}]*line-height/)
  end

  it 'adopts the Inter-tuned weights with the face' do
    expect(css).to match(/\.screen--text-scale-xlarge[^{]*\{[^}]*--label-font-weight:\s*500/)
  end

  it 'keeps bitmap typography at regular scale' do
    expect(css).not_to match(/\.screen--scale-regular[^{]*\{[^}]*font-family/)
  end

  it 'keeps bitmap typography at regular text scale' do
    expect(css).not_to match(/\.screen--text-scale-regular[^{]*\{[^}]*font-family/)
  end

  it 'keeps the TRMNL bitmap bundle for unscaled screens' do
    expect(css).to match(/\.screen\.screen--fonts-trmnl\{[^}]*--font-small-font-family:\s*"TRMNL12"/)
  end
end
