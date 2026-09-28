# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Framework do
  describe '.preload_data_files' do
    subject(:preload_data_files) { described_class.preload_data_files }

    let(:readers) { [Framework::Version, Framework::ColorData, Framework::Fonts, Framework::Devices] }

    before do
      readers.each(&:reload!)
      preload_data_files
    end

    after { readers.each(&:reload!) }

    context 'when a deploy removes the gem directory after boot' do
      before { allow(YAML).to receive(:load_file).and_raise(Errno::ENOENT) }

      it('keeps the versions readable') { expect(Framework::Version.latest).to be_a(Framework::Version) }
      it('keeps the colors readable') { expect(Framework::ColorData.color_hues).not_to be_empty }
      it('keeps the fonts readable') { expect(Framework::Fonts.bundle_ids).not_to be_empty }
      it('keeps the devices readable') { expect(Framework::Devices.device_specs).not_to be_empty }
    end
  end
end
