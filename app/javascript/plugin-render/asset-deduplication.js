/**
 * Asset Deduplication for Plugin Views (DOM cleanup only)
 *
 * Runs on DOMContentLoaded and removes duplicate <link rel="stylesheet"> and
 * <script src> nodes from the DOM. This fires AFTER those scripts have already
 * executed, so it does NOT prevent double-execution of duplicated scripts or the
 * re-application of duplicated styles. It only tidies the DOM by dropping the
 * redundant nodes. Server-side deduplication is the real fix; this is cosmetic.
 */

// Simple cleanup on page load - remove any remaining duplicates
document.addEventListener('DOMContentLoaded', () => {
  const seenStylesheets = new Set();
  const seenScripts = new Set();
  
  // Clean up duplicate stylesheets
  document.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
    const href = link.getAttribute('href');
    // Normalize the href to catch both regular and debug versions
    const normalizedHref = href.replace('.debug.css', '.css');
    
    if (seenStylesheets.has(normalizedHref) || seenStylesheets.has(href)) {
      link.remove();
      console.log(`Client-side removed duplicate stylesheet: ${href}`);
    } else {
      seenStylesheets.add(href);
      seenStylesheets.add(normalizedHref);
    }
  });
  
  // Clean up duplicate scripts
  document.querySelectorAll('script[src]').forEach(script => {
    const src = script.getAttribute('src');
    // Normalize the src to catch both regular and debug versions
    const normalizedSrc = src.replace('.debug.js', '.js');
    
    if (seenScripts.has(normalizedSrc) || seenScripts.has(src)) {
      script.remove();
      console.log(`Client-side removed duplicate script: ${src}`);
    } else {
      seenScripts.add(src);
      seenScripts.add(normalizedSrc);
    }
  });
}); 