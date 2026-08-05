# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CoreCompatHelper, type: :helper do
  describe '#plugin_image_path' do
    it 'serves vendored plugin icons from the gem public tree' do
      expect(helper.plugin_image_path('trmnl--render.svg')).to eq('/images/plugins/trmnl--render.svg')
    end

    it 'falls back to the CDN for icons the gem does not vendor' do
      expect(helper.plugin_image_path('missing-plugin--render.svg'))
        .to eq('https://trmnl.com/images/plugins/missing-plugin--render.svg')
    end
  end
end
