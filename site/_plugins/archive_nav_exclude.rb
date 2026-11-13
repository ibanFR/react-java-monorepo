# jekyll-archives generates pages without front-matter, so they would appear in
# just-the-docs sidebar navigation. This hook marks them nav_exclude after they
# are generated so they are always hidden from the sidebar.
Jekyll::Hooks.register :site, :pre_render do |site|
  site.pages.each do |page|
    if page.data["layout"] == "archive"
      page.data["nav_exclude"] = true
    end
  end
end
