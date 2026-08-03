# Renders the framework's own visual and runtime test pages under /framework/test/*.
# Prefixed because the engine is not isolated: a bare `TestsController` would claim a
# generic global name in every host.
class FrameworkTestsController < Framework.parent_controller_class
  layout :test_layout

  helper FrameworkHelper
  helper FrameworkDemoHelper

  def overflow; end
  def fonts; end
  def font_bundles; end
  def responsive_variants; end

  def runtime
    render layout: false
  end

  # The runtime fixture's script tag. A Playwright run intercepts this URL and serves
  # the variant it is measuring; without a suite in front of it, this hands over the
  # app's own bundle so the page works opened by hand.
  def runtime_bundle
    redirect_to helpers.framework_docs_asset_path('plugin-render/plugins.js')
  end

  def visual_paint
    render 'framework_tests/visual/paint'
  end

  def visual_borders
    render 'framework_tests/visual/borders'
  end

  def visual_components
    render 'framework_tests/visual/components'
  end

  def visual_compositions
    render 'framework_tests/visual/compositions'
  end

  def visual_responsive
    render 'framework_tests/visual/responsive'
  end

  private

  def test_layout
    action_name.start_with?('visual_') ? 'visual_test' : 'test'
  end
end
