# frozen_string_literal: true

require 'rails_helper'

# The Responsive Test page turns a device profile into a mode class. The picker options resolve
# each profile's depth as `css.bit_depth || color_depth`, and responsive_test.html.erb writes
# `screen--${bit}bit` onto every screen from that number. A depth the bundle carries no rules for
# leaves the device painting on the unmatched default, so the exported profiles and the compiled
# mode set have to stay in step.
#
# Every profile now exports a `css.bit_depth` of 1, 2 or 4, so no device the picker offers
# reaches `screen--8bit` or `screen--16bit`. generic_16_9 was the last profile above that ceiling
# and exports 4 today, so nothing in the registry pins those two tiers in place.
RSpec.describe FrameworkHelper, type: :helper do
  describe 'screen mode reachability' do
    subject(:css) { FrameworkBuild.plugins_css }

    it 'compiles mode rules for every bit depth the device picker can select' do
      by_depth = helper.framework_model_screen_picker_options.group_by { |option| option[:bitDepth].to_i }

      missing = by_depth.reject { |depth, _| css.include?(".screen.screen--#{depth}bit") }
                        .map { |depth, options| "#{depth}-bit (#{options.map { |option| option[:keyname] }.join(', ')})" }

      expect(missing).to be_empty,
                         "the device picker selects #{missing.join(', ')}, which the bundle has no mode rules for"
    end
  end
end
