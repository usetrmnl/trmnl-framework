# frozen_string_literal: true

Rails.application.routes.draw do
  # The framework docs ARE the app.
  root to: redirect("/framework")

  Framework.draw_routes(self)
end
