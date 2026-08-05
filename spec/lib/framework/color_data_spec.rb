# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Framework::ColorData do
  subject(:color_data) { described_class }

  let(:missing_path) { Framework.data_root.join('db/data/no_such_file.yml') }

  after { color_data.reload! }

  describe '.load' do
    it 'reads the framework colors data file' do
      expect(color_data.load).to include('color_palette', 'color_hues')
    end

    it 'reuses the parsed data rather than re-reading the file' do
      expect(color_data.load).to be(color_data.load)
    end

    context 'when a deploy removes the data file after the first read' do
      before do
        color_data.load
        allow(color_data).to receive(:yaml_path).and_return(missing_path)
      end

      it 'keeps serving the data it already parsed' do
        expect(color_data.load).to include('color_palette')
      end
    end
  end

  describe '.reload!' do
    it 'drops the memoized data so the next read re-parses the file' do
      original = color_data.load
      color_data.reload!
      expect(color_data.load).not_to be(original)
    end
  end
end
