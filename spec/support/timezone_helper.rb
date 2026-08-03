# frozen_string_literal: true

# Runs a block with ENV['TZ'] swapped, restoring the original value afterwards.
#
# CRuby re-reads ENV['TZ'] on every local time conversion, so the swap takes effect
# immediately within the process. The release tasks use this seam to prove their zip
# entry stamps are a function of the recorded release date alone, not of the timezone
# of the machine that happens to cut the release.
module TimezoneHelper
  def with_tz(timezone)
    original = ENV.fetch('TZ', nil)
    ENV['TZ'] = timezone
    yield
  ensure
    original.nil? ? ENV.delete('TZ') : ENV['TZ'] = original
  end
end

RSpec.configure do |config|
  config.include TimezoneHelper
end
