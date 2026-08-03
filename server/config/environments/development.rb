require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Docker bind mounts make per-request reload checks painful, and docs work is
  # mostly Sass/JS (covered by watchers). Restart the container after Ruby edits.
  running_in_docker = File.exist?("/.dockerenv") || ENV["DOCKER"].present?
  config.enable_reloading = !running_in_docker
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true

  # Docs pages render ~1.5MB HTML in ~1-2s (and rebuild the releases index on
  # the same path). Production caches both; without a store, every click pays
  # that cost again. Docker turns caching on by default; locally use
  # `bin/rails dev:cache`.
  if running_in_docker || Rails.root.join("tmp/caching-dev.txt").exist?
    config.action_controller.perform_caching = true
    config.cache_store = :memory_store, { size: 64 * 1024 * 1024 }
  else
    config.action_controller.perform_caching = false
    config.cache_store = :null_store
  end

  config.active_support.deprecation = :log
  config.active_support.disallowed_deprecation = :raise
  config.active_support.disallowed_deprecation_warnings = []

  # Annotation comments wrap each partial's output, which breaks sprite_icon_symbol's
  # trailing-</svg> rewrite (every <symbol> stays unclosed and the whole icon sheet
  # dies) and would leak into the generated markdown docs.
  config.action_view.annotate_rendered_view_with_filenames = false
  config.action_controller.raise_on_missing_callback_actions = true

  # Serve the framework's static assets (fonts, images, compiled CSS/JS) in dev.
  config.public_file_server.enabled = true
end
