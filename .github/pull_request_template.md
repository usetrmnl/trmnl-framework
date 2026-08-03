## What and why

Describe the change and the reason for it. Link any related issue.

## Checklist

- [ ] `bundle exec rspec` passes (the Ruby suite, behind the required `RSpec` check).
- [ ] `bundle exec rubocop` passes.
- [ ] `npm run test:stylesheets`, `npm run test:scripts` and `npm run test:rulediff` pass.
- [ ] `bin/build` succeeds (no undefined Sass references).
- [ ] `bin/check-em-dashes` passes, and no em-dashes in any docs copy or comments I touched.
- [ ] Generated files regenerated and committed if their sources moved: `rake
      framework:colors`, `rake framework:docs_chrome`, `rake framework:legacy_bundle`.
- [ ] Docs updated: if a utility or API changed, its docs page and live example were
      updated in this PR.
- [ ] Rendering change: `npm run test:runtime` and `npm run test:visual` run locally, with
      any intentional baseline updates committed.
- [ ] Change is small and focused (one concern).
