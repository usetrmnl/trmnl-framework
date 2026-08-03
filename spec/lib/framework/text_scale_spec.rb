# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Framework::TextScale do
  it 'exposes one option per multiplier' do
    expect(described_class.options.map(&:last)).to eq(described_class::MULTIPLIERS.keys)
  end

  it 'resolves a multiplier per id' do
    expect(described_class.ids.map { |id| described_class.multiplier(id) }).to eq(%w[0.8 1 1.25 1.5])
  end

  it 'raises on unknown ids' do
    expect { described_class.multiplier('gigantic') }.to raise_error(KeyError)
  end

  it 'mirrors the framework $text-scale-values map' do
    scss = Rails.root.join('app/assets/stylesheets/framework/utilities/_text_scale.scss').read
    scss_values = scss.scan(/'([a-z]+)':\s*([\d.]+)/).to_h

    expect(scss_values).to eq(described_class::MULTIPLIERS)
  end
end
