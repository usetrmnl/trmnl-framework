# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Docs server: public, no auth, no database. Nothing in the engine asks who the
  # visitor is, so there is nothing to stub here. Mother app replaces this with its
  # own ApplicationController when the engine is loaded there.
end
