require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false

  config.action_controller.perform_caching = true
  config.public_file_server.enabled = true
  # Covers this server's own public/ (the static error pages). The release archive is
  # served by Framework::Static, which sits ahead of ActionDispatch::Static and prices
  # each file by whether its path names a published version.
  config.public_file_server.headers = { "cache-control" => "public, max-age=#{1.hour.to_i}" }

  config.log_level = :info
  config.log_tags = [:request_id]
end
