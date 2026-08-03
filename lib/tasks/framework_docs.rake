# The Markdown generator parses each rendered page with Nokogiri and converts it with
# ReverseMarkdown. Neither gem is a runtime dependency of the engine: mounting it needs
# neither, so both sit in the Gemfile's development/test group with the rest of the
# build-only tooling, and this is the one seam that loads them. nokogiri happens to be
# installed anyway on any Rails host (actionview pulls it through rails-html-sanitizer),
# which is exactly why the undeclared use went unnoticed; requiring it by name here means
# a host that loses that transitive copy gets this message instead of a NameError.
def require_markdown_gems!
  missing = %w[nokogiri reverse_markdown].reject do |gem_name|
    require gem_name
    true
  rescue LoadError
    false
  end
  return if missing.empty?

  abort <<~MISSING
    framework:generate_markdown needs #{missing.join(' and ')}, which the engine does not
    install for you. Add to your Gemfile and re-run:
    #{missing.map { |gem_name| "  gem \"#{gem_name}\", require: false" }.join("\n")}
  MISSING
end

def extract_first_paragraph(md_path)
  return "" unless File.exist?(md_path)

  File.readlines(md_path).each do |line|
    stripped = line.strip
    next if stripped.empty? || stripped.start_with?("#") || stripped.start_with?("[#]") || stripped == "Beta"

    return stripped
  end
  ""
end

def html_to_markdown(html)
  doc = Nokogiri::HTML.fragment(html)

  # Existing strips
  doc.css("svg, script, style, button, [data-controller='copy-page'], [class*='badge-border']").each(&:remove)

  # Rich link tooltips: replace with plain link, strip tooltip span
  doc.css("span[data-controller='docs-ref-tooltip']").each do |node|
    link = node.at_css("a")
    if link
      plain = doc.document.create_element("a", link.text.strip, "href" => link["href"])
      node.replace(plain)
    end
  end

  # Prev/Next navigation footer (rendered by _page_navigation.html.erb)
  doc.css("div.space-y-4").each do |div|
    div.remove if div.at_css("div.justify-between.items-stretch")
  end

  # Tab toggle comparison labels (keep content underneath)
  doc.css("div[class*='gap-x-6'][class*='gap-y-0'] > div[class*='rounded-t-lg']").each(&:remove)

  markdown = ReverseMarkdown.convert(
    doc.to_html,
    unknown_tags: :bypass,
    github_flavored: true
  )

  # Anchor links before headings: [#](http://localhost...)
  markdown.gsub!(/^\[#\]\([^)]*\)\s*\n+/m, "")

  # Localhost image references (covers duplicate plugin icons too)
  markdown.gsub!(%r{!\[[^\]]*\]\(http://localhost[^)]*\)\s*}m, "")

  # Add space between bold-close and link-open: **[Link] → ** [Link]
  markdown.gsub!(/\*\*(\[)/, '** \1')

  # Join orphaned links back to previous line (single \n, not \n\n)
  markdown.gsub!(/([^\n])\n(\[[^\]]+\]\([^)]+\))/, '\1 \2')

  markdown
end

namespace :framework do
  desc "Generate prebuilt Markdown docs, /llms.txt, and /llms-full.txt"
  task generate_markdown: :environment do
    require_markdown_gems!

    # The framework's own public/, not the host's: Framework::Static serves these files
    # from there, so a page's `.md` twin resolves wherever the engine is mounted. Writing
    # into Rails.public_path left them in the docs server's untracked public dir, where
    # only that one server could see them.
    public_dir = Framework.public_root
    docs_base_dir = public_dir.join('framework/docs')
    examples_dir = public_dir.join('framework/examples')

    # An installed gem can sit in a root-owned directory. Say why up front instead of
    # failing on EACCES several hundred files into the run.
    abort "Cannot write #{public_dir}. Install the gem somewhere writable, or run this task from a checkout." unless File.writable?(public_dir)

    # Clean outdated flat files and all version subdirectories
    FileUtils.rm_f(Dir.glob(docs_base_dir.join("*.md")))
    stale_or_supported_versions = (
      FrameworkController::SUPPORTED_DOCS_VERSIONS +
      FrameworkController::LEGACY_DOCS_VERSION_ALIASES.keys
    ).uniq
    stale_or_supported_versions.each do |version|
      FileUtils.rm_f(Dir.glob(docs_base_dir.join(version, "*.md")))
    end
    FileUtils.rm_f(Dir.glob(examples_dir.join("*.md")))
    FileUtils.rm_f(public_dir.join("llms.txt"))
    FileUtils.rm_f(public_dir.join("llms-full.txt"))
    FileUtils.mkdir_p(examples_dir)

    app = ActionDispatch::Integration::Session.new(Rails.application)
    app.host! "localhost"
    prod_base = ENV.fetch("APP_URL", "https://trmnl.com")

    # Generate doc .md files for all versions
    total_docs = 0
    FrameworkController::DOC_GROUPS_BY_VERSION.each do |version, groups|
      version_dir = docs_base_dir.join(version)
      FileUtils.mkdir_p(version_dir)

      groups.values.flatten.each do |page|
        app.get("/framework/docs/#{version}/#{page}?_raw=1")
        File.write(version_dir.join("#{page}.md"), html_to_markdown(app.response.body))
        print "."
        total_docs += 1
      end
    end

    # Generate example .md files
    example_keys = FrameworkController.new.layout_examples_config.keys
    example_keys.each do |key|
      app.get("/framework/examples/#{key}?_raw=1")
      File.write(examples_dir.join("#{key}.md"), html_to_markdown(app.response.body))
      print "."
    end

    # Fetch the public Intercom help-center articles to enrich the llms
    # outputs. The token is needed only for this fetch; without it (community
    # checkouts) the step is skipped and the outputs build from the framework
    # docs alone.
    help_articles = {}
    intercom_token = ENV["INTERCOM_TOKEN"].to_s.strip
    if intercom_token.empty?
      puts "\nSkipping Intercom help articles (INTERCOM_TOKEN not set)"
    else
      require "net/http"

      help_page = 1
      loop do
        uri = URI("https://api.intercom.io/articles?per_page=50&page=#{help_page}")
        request = Net::HTTP::Get.new(uri)
        request["Authorization"] = "Bearer #{intercom_token}"
        request["Accept"] = "application/json"
        response = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(request) }
        raise "Intercom articles fetch failed: HTTP #{response.code}" unless response.is_a?(Net::HTTPSuccess)

        payload = JSON.parse(response.body)
        payload["data"]&.each do |article|
          help_articles[article["id"]] = {
            "title" => article["title"],
            "description" => article["description"],
            "url" => article["url"],
            "body" => article["body"]
          }
        end
        total_pages = payload.dig("pages", "total_pages") || 1
        break if help_page >= total_pages

        help_page += 1
      end
      puts "\nFetched #{help_articles.length} help articles"
    end

    # Build /llms.txt (references current version)
    current_version = FrameworkController::CURRENT_DOCS_VERSION
    current_docs_dir = docs_base_dir.join(current_version)
    titles = FrameworkController.helpers.page_titles
    lines = [
      "# TRMNL",
      "",
      "> ePaper display platform with customizable content. Build custom layouts for TRMNL devices using the Framework UI.",
      "",
      "TRMNL is a platform for building and displaying content on ePaper screens. The Framework UI provides HTML/CSS utilities, layout primitives, and components purpose-built for 1-bit and 2-bit ePaper rendering.",
      ""
    ]

    FrameworkController::DOC_GROUPS_BY_VERSION.fetch(current_version).each do |category, cat_pages|
      lines << "## #{category.to_s.titleize}"
      lines << ""
      cat_pages.each do |page|
        title = titles[page] || page.titleize
        url = "#{prod_base}/framework/docs/#{current_version}/#{page}.md"
        desc = extract_first_paragraph(current_docs_dir.join("#{page}.md"))
        lines << "- [#{title}](#{url}): #{desc}"
      end
      lines << ""
    end

    # Help articles
    if help_articles.any?
      lines << "## Help Articles"
      lines << ""
      help_articles.each_value do |article|
        next if article["title"].blank? || article["title"] == "Untitled public article"

        url = article["url"] || "#"
        desc = article["description"].presence || ""
        lines << "- [#{article['title']}](#{url}): #{desc}".strip
      end
      lines << ""
    end

    # Instructions section
    lines << "## Instructions"
    lines << ""
    # Read from the version registry rather than written out: a new frozen track joins
    # SUPPORTED_DOCS_VERSIONS and this sentence with it.
    older_versions = FrameworkController::SUPPORTED_DOCS_VERSIONS - [current_version]
    lines << "- Use Framework #{current_version} (current). Framework #{older_versions.to_sentence} are available for compatibility."
    lines << "- All framework CSS classes use the `--` separator (e.g., `w--full`, `bg--black`, `gap--md`)."
    lines << "- Framework is designed for ePaper displays: 1-bit (black/white) and 2-bit (4 shades of gray)."
    lines << "- Layouts are built with `view`, `layout`, `title_bar`, and `columns` primitives."
    lines << "- Use the Overflow and Clamp engines for handling content that exceeds available space."
    lines << "- The framework runtime automatically adapts layouts to device bit-depth and orientation."
    lines << ""

    File.write(public_dir.join("llms.txt"), lines.join("\n"))

    # Build /llms-full.txt from current version docs
    current_pages = FrameworkController::DOC_GROUPS_BY_VERSION.fetch(current_version).values.flatten
    full_content = current_pages.map { |page| File.read(current_docs_dir.join("#{page}.md")) }

    help_articles.each_value do |article|
      next if article["title"].blank? || article["title"] == "Untitled public article"

      markdown = ReverseMarkdown.convert(article["body"] || "", unknown_tags: :bypass, github_flavored: true)
      markdown = markdown.gsub(/!\[.*?\]\(.*?\)/, "")
      full_content << "# #{article['title']}\n\n#{markdown}"
    end

    File.write(public_dir.join("llms-full.txt"), full_content.join("\n\n---\n\n"))

    puts "\nGenerated #{total_docs} docs + #{example_keys.length} examples + llms.txt + llms-full.txt in #{public_dir}"
  end

  desc "Add IDs to headings in framework documentation"
  task add_heading_ids: :environment do
    framework_pages = FrameworkController::DOC_GROUPS_BY_VERSION.fetch(FrameworkController::CURRENT_DOCS_VERSION).values.flatten

    framework_pages.each do |page|
      file_path = Framework::Engine.root.join('app', 'views', 'framework', "#{page}.html.erb")

      if File.exist?(file_path)
        content = File.read(file_path)

        # Replace h3 headings
        updated_content = content.gsub(%r{<h3 class="<%= framework_section_title_classes %>">([^<]+)</h3>}) do |_match|
          "<%= framework_heading(3, '#{Regexp.last_match(1)}') %>"
        end

        # Replace h4 headings
        updated_content = updated_content.gsub(%r{<h4 class="<%= framework_subsection_title_classes %>">([^<]+)</h4>}) do |_match|
          "<%= framework_heading(4, '#{Regexp.last_match(1)}') %>"
        end

        File.write(file_path, updated_content)

        puts "Updated headings in #{page}.html.erb"
      else
        puts "File not found: #{file_path}"
      end
    end

    puts "Completed adding IDs to headings in framework documentation"
  end
end
