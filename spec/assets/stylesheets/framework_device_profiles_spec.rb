# frozen_string_literal: true

require 'rails_helper'
require 'bigdecimal'

# Every shipped device profile, checked against the CSS it compiles to.
#
# _devices.scss is generated from core's device models and feeds screen-w/screen-h,
# pixel-ratio, dither-pixel-ratio, ui-scale, color-depth, density-tier, gap-scale, and
# size into every per-device generator. A wrong value or a mistyped key compiles cleanly
# and ships a device that renders at the wrong scale or density, and until now only three
# of the profiles appeared in any test at all. framework_custom_devices_spec.rb proves the
# generator wiring for one synthetic profile; this walks the whole map, so the cost is one
# compiled bundle rather than one example per device.
#
# Two truths are compared here, and they are different truths: the map is what the
# stylesheets compile from, and db/data/framework_devices.yml is what core exports. Drift
# between them is the failure this file exists to name.
RSpec.describe 'Framework device profiles' do
  subject(:css) { FrameworkBuild.plugins_css }

  stylesheets = Framework::Engine.root.join('app/assets/stylesheets/framework')

  # The generated map, read as data. Its shape is machine-written and uniform: one
  # profile per `'name': (` block, one `'key': value` per line.
  profiles = stylesheets.join('config/_devices.scss').read
                        .scan(/^ {4}'([a-z0-9_+-]+)':\s*\(\n(.*?)\n {4}\)/m)
                        .to_h do |name, body|
    [name, body.scan(/^ {8}'([a-z-]+)':\s*(.+?),?$/).to_h { |key, value| [key, value.delete("'")] }]
  end

  # The schema _custom.scss validates configured profiles against. The generated map is
  # never put through it, which is exactly why the shipped profiles are checked here.
  custom = stylesheets.join('config/_custom.scss').read
  def custom.list_of(name) = self[/\$-#{name}:\s*(.*?);/m].to_s.scan(/'([a-z0-9-]+)'/).flatten
  required_keys = custom.list_of('required-keys')
  valid_sizes = custom.list_of('valid-sizes')
  valid_density_tiers = custom.list_of('valid-density-tiers')

  # The whole file reads from `profiles`, so an emptied parse would pass everything below
  # while asserting nothing. These two examples are what stops that.
  it 'reads the shipped device map' do
    aggregate_failures do
      expect(profiles.size).to be >= 45
      expect(profiles.fetch('og')).to include('screen-w' => '800px', 'screen-h' => '480px', 'color-depth' => '1')
    end
  end

  it 'reads the device schema the custom-device validator enforces' do
    aggregate_failures do
      expect(required_keys).to include('screen-w', 'color-depth', 'density-tier', 'size')
      expect(valid_sizes).to eq(%w[sm md lg])
      expect(valid_density_tiers).to eq(%w[1x 2x])
    end
  end

  # A profile declares px lengths and unitless ratios; the bundle prints 1.0 as 1. Compare
  # the numbers, not the spellings, and compare them as decimals: these are authored
  # literals, so 0.9846 has to mean exactly itself.
  def same_number?(emitted, declared)
    BigDecimal(emitted.to_s.delete_suffix('px')) == BigDecimal(declared.to_s.delete_suffix('px'))
  rescue ArgumentError, TypeError
    false
  end

  # One pass over the bundle: every selectors{body} pair, selectors split and stripped.
  # The per-profile checks below walk this index. Regexing the full bundle once per
  # profile scaled as profiles times bundle size and tripped Regexp timeouts under
  # parallel shards once the bundle grew.
  def rule_groups
    @rule_groups ||= css.scan(/([^{}]+)\{([^{}]*)\}/)
                        .map { |selectors, body| [selectors.split(',').map(&:strip), body] }
  end

  def group_with(first_suffix, second_suffix)
    rule_groups.any? do |selectors, _body|
      selectors.any? { |selector| selector.end_with?(first_suffix) } &&
        selectors.any? { |selector| selector.end_with?(second_suffix) }
    end
  end

  def device_rule(_css, name)
    suffix = ".trmnl .screen--#{name}"
    rule_groups.find { |selectors, _body| selectors.last.end_with?(suffix) }&.last
  end

  def declared(rule, property) = rule[/--#{Regexp.escape(property)}:\s*([^;}]+)/, 1]

  it 'holds every shipped profile to the schema configured profiles are validated against' do
    offenders = profiles.filter_map do |name, config|
      missing = required_keys - config.keys
      problems = []
      problems << "missing #{missing.join(', ')}" if missing.any?
      problems << "size #{config['size']}" unless valid_sizes.include?(config['size'])
      problems << "density-tier #{config['density-tier']}" unless valid_density_tiers.include?(config['density-tier'])
      "#{name}: #{problems.join('; ')}" if problems.any?
    end

    expect(offenders).to be_empty, "these profiles do not satisfy the device schema:\n  #{offenders.join("\n  ")}"
  end

  it 'compiles a profile rule for every device the map declares, and for no other' do
    emitted = css.scan(/--device-name:\s*"([a-z0-9_+-]+)"/).flatten.uniq
    expect(emitted).to match_array(profiles.keys)
  end

  it 'emits each profile geometry, ratios, scales, and depth verbatim' do
    offenders = profiles.flat_map do |name, config|
      rule = device_rule(css, name)
      next ["#{name}: no .screen--#{name} rule"] if rule.nil?

      {
        'screen-w' => config['screen-w'], 'screen-h' => config['screen-h'],
        'screen-w-original' => config['screen-w'], 'screen-h-original' => config['screen-h'],
        'pixel-ratio' => config['pixel-ratio'], 'dither-pixel-ratio' => config['dither-pixel-ratio'],
        'device-ui-scale' => config['ui-scale'], 'gap-scale' => config['gap-scale'],
        'color-depth' => config['color-depth']
      }.filter_map do |property, value|
        emitted = declared(rule, property)
        "#{name}/#{property}: map #{value}, bundle #{emitted.inspect}" unless same_number?(emitted, value)
      end + [
        ("#{name}/density-tier: map #{config['density-tier']}, bundle #{declared(rule, 'density-tier').inspect}" unless declared(rule, 'density-tier') == config['density-tier']),
        ("#{name}/device-name: bundle #{declared(rule, 'device-name').inspect}" unless declared(rule, 'device-name') == %("#{name}"))
      ].compact
    end

    expect(offenders).to be_empty, "these profiles do not match the map they compile from:\n  #{offenders.join("\n  ")}"
  end

  it 'joins each profile to the size group its map entry names' do
    offenders = profiles.reject do |name, config|
      group_with(".trmnl .screen--#{config['size']}", ".trmnl .screen--#{name}")
    end.keys

    expect(offenders).to be_empty, "these profiles never extend their size group: #{offenders.join(', ')}"
  end

  # Only the 2x tier carries rules, so only that extend resolves (the map's extends are
  # !optional). A 1x profile is covered by --density-tier above.
  it 'joins each 2x profile to the density group' do
    offenders = profiles.select { |_, config| config['density-tier'] == '2x' }.reject do |name, _|
      group_with('.screen.screen--density-2x', ".screen.screen--#{name}")
    end.keys

    expect(offenders).to be_empty, "these 2x profiles never extend the density group: #{offenders.join(', ')}"
  end

  # screen--1x asks for 1x display scale while dither patterns stay on the panel's own
  # ratio, so the override has to carry the device's number, not a constant.
  it 'carries each profile dither ratio into its screen--1x override' do
    offenders = profiles.filter_map do |name, config|
      override = rule_groups.find { |selectors, _body| selectors.last.end_with?(".screen--#{name}.screen--1x") }&.last
      next "#{name}: no screen--1x override" if override.nil?

      emitted = declared(override, 'dither-pixel-ratio')
      "#{name}: map #{config['dither-pixel-ratio']}, bundle #{emitted.inspect}" unless same_number?(emitted, config['dither-pixel-ratio'])
    end

    expect(offenders).to be_empty, "these profiles lose their dither ratio under screen--1x:\n  #{offenders.join("\n  ")}"
  end

  # utilities/_outline.scss raises the outline color for dither-pixel-ratio >= 2 and only
  # there: the 2x corner fill-ins key on the ratio the dot geometry scales with, not the
  # preview upscale factor (TRMNL X previews at pixel-ratio 1.8 and still needs them).
  # Sass folds the raised profiles into one grouped selector, so membership is checked
  # per selector rather than per rule.
  it 'raises the outline color for exactly the double-density profiles' do
    raised_selectors = rule_groups.filter_map do |selectors, body|
      selectors if body.include?('--_outline-hdpi-color')
    end.flatten
    offenders = profiles.filter_map do |name, config|
      raised = raised_selectors.any? { |selector| selector.match?(/\.screen--#{Regexp.escape(name)}\z/) }
      expected = Float(config['dither-pixel-ratio']) >= 2
      "#{name} (dither-pixel-ratio #{config['dither-pixel-ratio']}): #{raised ? 'raised' : 'not raised'}" unless raised == expected
    end

    expect(offenders).to be_empty, "these profiles take the wrong outline branch:\n  #{offenders.join("\n  ")}"
  end

  describe 'against the manifest core exports' do
    # Several hardware models share one CSS profile (og and ogv2 each cover a handful), so
    # the export is grouped by keyname before it is compared.
    exported = Framework::Devices.device_specs.group_by { |device| device.dig('css', 'keyname') }

    it 'exports a device set the map covers' do
      aggregate_failures do
        expect(exported.size).to be >= 36
        expect(profiles.keys).to include(*exported.keys)
      end
    end

    it 'matches every exported profile geometry, ratios, scales, size, and tier' do
      offenders = exported.flat_map do |keyname, models|
        config = profiles.fetch(keyname)

        models.flat_map do |model|
          exported_css = model.fetch('css')
          {
            'screen-w' => exported_css['screen_w'], 'screen-h' => exported_css['screen_h'],
            'ui-scale' => exported_css['ui_scale'], 'gap-scale' => exported_css['gap_scale'],
            'pixel-ratio' => exported_css['pixel_ratio'], 'dither-pixel-ratio' => exported_css['dither_pixel_ratio']
          }.filter_map do |property, value|
            "#{keyname}/#{property}: manifest #{value}, map #{config[property]}" unless same_number?(config[property], value)
          end + [
            ("#{keyname}/size: manifest #{exported_css['size']}, map #{config['size']}" unless config['size'] == exported_css['size']),
            ("#{keyname}/density: manifest #{model['density_class']}, map #{config['density-tier']}" unless model['density_class'] == "screen--density-#{config['density-tier']}")
          ].compact
        end
      end.uniq

      expect(offenders).to be_empty, "the device map and db/data/framework_devices.yml disagree:\n  #{offenders.join("\n  ")}"
    end

    # The export carries two depth fields, and the models sharing a profile do not all
    # agree with each other: seeed_e1002 exports 1 on the ogv2 profile its four siblings
    # export 2 for. Which one a profile should follow is core's call, so the assertion is
    # that the compiled depth is one core exports for that device: a depth core never
    # named is drift either way.
    it 'compiles a color depth the manifest exports for that device' do
      offenders = exported.filter_map do |keyname, models|
        depths = models.flat_map { |model| [model.dig('css', 'bit_depth'), model['color_depth']] }.compact.map(&:to_s).uniq
        compiled = profiles.fetch(keyname)['color-depth']
        "#{keyname}: map #{compiled}, manifest #{depths.join(' or ')}" unless depths.include?(compiled)
      end

      expect(offenders).to be_empty, "these profiles compile a depth the manifest never exports:\n  #{offenders.join("\n  ")}"
    end
  end
end
