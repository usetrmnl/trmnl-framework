# frozen_string_literal: true

require 'rails_helper'

# Drift guard for the runtime's public JavaScript surface: every global and event
# the Framework Runtime page documents has to exist in plugins.js, and every
# public global plugins.js assigns has to be documented somewhere in the docs.
RSpec.describe 'Framework runtime API docs' do
  def self.read(relative_path)
    File.read(Framework::Engine.root.join(relative_path), encoding: 'UTF-8')
  end

  runtime_js = read('app/javascript/plugin-render/plugins.js')
  runtime_page = read('app/views/framework/framework_runtime.html.erb')

  # Documented on the Framework Runtime page.
  entry_points = %w[terminalize executeTerminalize markFrameworkReady].freeze
  flags = %w[TRMNL_PLUGINS_READY frameworkReady __TRMNL_BUILD__].freeze
  events = %w[trmnl:terminalize:stats trmnl:framework:ready].freeze
  # Assigned by plugins.js, documented on the Paint API pages instead.
  paint_globals = %w[TRMNLPaint TRMNLCharts].freeze

  describe 'plugins.js' do
    it 'exposes every documented entry point on window' do
      missing = entry_points.reject { |name| runtime_js.include?("window.#{name} = #{name};") }
      expect(missing).to be_empty
    end

    it 'assigns every documented flag on window' do
      missing = flags.reject { |name| runtime_js.include?("window.#{name} =") }
      expect(missing).to be_empty
    end

    it 'dispatches the documented events' do
      expect(runtime_js).to include("new CustomEvent('trmnl:terminalize:stats'")
      expect(runtime_js).to include("new Event('trmnl:framework:ready')")
    end

    it 'documents every public global it assigns' do
      assigned = runtime_js.scan(/^\s*window\.([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)/).flatten.uniq
      undocumented = assigned - entry_points - flags - paint_globals
      expect(undocumented.reject { |name| name.start_with?('__') }).to be_empty
    end
  end

  describe 'the Framework Runtime page' do
    it 'lists every entry point with its call signature' do
      missing = entry_points.reject { |name| runtime_page.include?("#{name}()") }
      expect(missing).to be_empty
    end

    it 'names every readiness flag' do
      missing = flags.reject { |name| runtime_page.include?("window.#{name}") }
      expect(missing).to be_empty
    end

    it 'names every event the runtime dispatches' do
      missing = events.reject { |name| runtime_page.include?(name) }
      expect(missing).to be_empty
    end

    it 'points at the Paint API for the globals documented there' do
      expect(runtime_page).to include('DocsRef.new(page: :paint_api)')
    end
  end
end
