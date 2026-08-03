# frozen_string_literal: true

require_relative "server/config/environment"

run Rails.application
Rails.application.load_server
