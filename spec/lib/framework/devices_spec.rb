# frozen_string_literal: true

require 'rails_helper'
require 'tmpdir'

RSpec.describe Framework::Devices do
  subject(:devices) { described_class }

  describe '.manifest' do
    it 'reads the exported device manifest data file' do
      expect(devices.manifest).to include('devices', 'palettes', 'picker_models')
    end

    it 'freezes the loaded manifest against mutation' do
      expect(devices.manifest).to be_frozen
    end

    context 'when the manifest data file is missing' do
      after { devices.reload! }

      it 'raises rather than returning empty data' do
        Dir.mktmpdir do |dir|
          allow(Framework).to receive(:data_root).and_return(Pathname.new(dir))
          devices.reload!
          expect { devices.manifest }.to raise_error(Errno::ENOENT)
        end
      end
    end
  end

  describe '.device_specs' do
    it 'lists every exported device keyed by keyname' do
      expect(devices.device_specs).to all(include('keyname'))
    end
  end

  describe '.palettes' do
    it 'lists every exported palette with its framework class' do
      expect(devices.palettes).to all(include('id', 'framework_class'))
    end
  end

  describe '.picker_models' do
    it 'exposes the screen-picker device models' do
      expect(devices.picker_models).to all(include('name'))
    end
  end

  describe '.picker_palettes' do
    it 'exposes the screen-picker palettes with their framework class' do
      expect(devices.picker_palettes).to all(include('id', 'framework_class'))
    end
  end

  describe '.example_plugins' do
    it 'maps each example plugin key to its display metadata' do
      expect(devices.example_plugins.values).to all(include('name', 'description'))
    end
  end

  describe '.reload!' do
    it 'drops the memoized manifest so the next read re-parses the file' do
      original = devices.manifest
      devices.reload!
      expect(devices.manifest).not_to be(original)
    end
  end
end
