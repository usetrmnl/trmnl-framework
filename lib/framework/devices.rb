# frozen_string_literal: true

require "yaml"

module Framework
  # Reads the resolved device/palette manifest exported from core
  # (db/data/framework_devices.yml). Core dictates the device set: the framework
  # consumes this export and cannot invent devices.
  module Devices
    def self.yaml_path
      if defined?(Framework::Engine)
        Framework.data_root.join("db/data/framework_devices.yml")
      else
        File.expand_path("../../db/data/framework_devices.yml", __dir__)
      end
    end

    def self.manifest = @manifest ||= YAML.load_file(yaml_path).freeze

    def self.device_specs = manifest["devices"]
    def self.palettes = manifest["palettes"]
    def self.picker_models = manifest["picker_models"]
    def self.picker_palettes = manifest["picker_palettes"]
    def self.example_plugins = manifest["example_plugins"]

    # Test/dev hook: drop the memoized manifest after re-exporting from core.
    def self.reload! = @manifest = nil
  end
end
