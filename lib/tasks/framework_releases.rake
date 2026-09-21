# frozen_string_literal: true

namespace :framework do
  namespace :releases do
    desc "Download every released css/js/zip this host lacks into storage/framework_releases (not committed)"
    task fetch: :environment do
      fetched = Framework::Releases.fetch
      puts "framework releases: fetched #{fetched.size} into #{Framework.releases_root}"
    end
  end
end
