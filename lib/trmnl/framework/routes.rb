# frozen_string_literal: true

module Framework
  # Draws framework routes into the host mapper without a mount prefix, so helpers
  # stay unprefixed (framework_docs_colors_path, etc.).
  def self.draw_routes(mapper)
    routes_file = Engine.root.join("config/routes/framework.rb")
    mapper.instance_eval(File.read(routes_file), routes_file.to_s)
  end
end
