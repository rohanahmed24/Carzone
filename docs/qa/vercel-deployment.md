# Carzone Vercel deployment

Date: 2026-08-31, Asia/Dhaka. The user separately requested Vercel deployment and a repository update after the implementation handoff. That request authorized publication despite the transparently documented outstanding browser/visual acceptance gate.

## Deploy result

- URL: [carzone-psi.vercel.app](https://carzone-psi.vercel.app)
- Target: production
- Status: READY, confirmed through Vercel deployment inspection and alias resolution
- Application/configuration release commit: [`a09054c8518ceab21d37489b9ed5f1cd8926d49c`](https://github.com/rohanahmed24/Carzone/commit/a09054c8518ceab21d37489b9ed5f1cd8926d49c)
- Framework: Other/static multi-page HTML; Node24.x build runtime
- First production deployment: `dpl_61kUxGGFP1U3DnGsNg7fqqZy3PmX`
- Immutable first-deployment URL: [carzone-r8f29w3f9-rohanahmed24s-projects.vercel.app](https://carzone-r8f29w3f9-rohanahmed24s-projects.vercel.app)
- Created: 2026-08-31 23:24:39 +06:00
- Reported deployment duration:10 seconds; remote build stage reported5 seconds

This record identifies the first verified application release. Subsequent documentation-only pushes can create a new deployment of the same application through the Git integration; the stable production URL remains the entry point.

## 2026-09-02 production update

Homepage sections (collections, path, compare trio, local previews) plus the earlier compare-tray / storage-warning / Saved Undo fixes were merged to `main` as [`5f396e5`](https://github.com/rohanahmed24/Carzone/commit/5f396e5102b2c9717181c3bfce68b8b428017948). Vercel Git production completed READY.

- Stable URL (unchanged): [carzone-psi.vercel.app](https://carzone-psi.vercel.app)
- Immutable this-release URL: [carzone-9cfaw00zl-rohanahmed24s-projects.vercel.app](https://carzone-9cfaw00zl-rohanahmed24s-projects.vercel.app)
- Dashboard: [BmLcb7PAcqQjLUVPsot5rUabHVXc](https://vercel.com/rohanahmed24s-projects/carzone/BmLcb7PAcqQjLUVPsot5rUabHVXc)
- Live homepage confirmed to include **Look closer.**, **A short path. Local only.**, **A useful first trio**, and **Try the other routes.** Local `npm run check` on merged `main`: **79 tests, 0 failures**.

## Repository and deployment configuration

Repository: [rohanahmed24/Carzone](https://github.com/rohanahmed24/Carzone). The modernization branch was fast-forwarded into `main` and pushed normally, from baseline `cc63d10` to `a09054c`; no force push or history rewrite. Original Webflow export files remained unchanged.

Vercel project: `carzone`, under `rohanahmed24s-projects`. Project root is the Carzone repository root, not the parent Portfolio Projects directory. GitHub is connected, and `main` produces production deployments.

`vercel.json` configures `npm ci`, `npm run build && node scripts/check-artifact.mjs`, and `outputDirectory: dist`. `cleanUrls: false` retains the existing HTML paths. There is no SPA fallback, route rewrite or domain purchase. Vercel serves the generated artifact, not the historical root HTML.

`.vercelignore` excludes legacy root HTML/CSS/JS, documentation, local task workspace and environment files from the build upload. All158 tracked package/scripts/src/assets/images build-input paths were checked and none were excluded. `.env.local` and `.vercel/project.json` are Git-ignored and untracked; their secret contents were not read or committed.

## Release verification

- Local release command `npm run check`: exit0,78 tests passed,0 failures/skips/cancellations; build and artifact checker passed.
- Local artifact:96 files,14 HTML routes,1,025,287 disk bytes. These are not network-transfer measurements.
- Independent focused deployment review: correct Node24/static/dist configuration, required inputs preserved, all14 HTML paths present, no fallback redirects/rewrites and no tracked environment/Vercel credentials.
- Cloud build logs explicitly cloned GitHub `main` at `a09054c`, ran `npm ci`, built `dist`, printed `Artifact verification passed.`, and completed deployment.
- Cloud installation reported0 dependency vulnerabilities in that installation audit. This is not a comprehensive security assessment.
- Local administrative CLI:59.10.0. Vercel cloud build CLI:59.3.0, as logged by the provider.

## Post-deploy observability and limits

The deployment is static; there are no application serverless functions or real form receivers. A bounded provider error-log scan (`vercel logs --deployment dpl_61kUxGGFP1U3DnGsNg7fqqZy3PmX --level error --since 1h --limit 20`) returned “No logs found” immediately after release. This means no matching error entries were returned in that brief window, not that real-user journeys or traffic were validated. Log drains were not inspected/configured, and no ongoing monitoring or scheduled task was created.

Browser operations remain blocked by the earlier selected-browser security policy. No alternate browser, port or indirect automation was used to complete the denied visual checks. Deployment status and cloud build logs are operational evidence, not a substitute for buyer journeys, keyboard/zoom checks, final responsive screenshots or paired visual comparisons. See [implementation QA](carzone-results.md) and [design QA](../../design-qa.md).
