# Samuel Monteiro Portfolio

A technical portfolio showcasing infrastructure architecture, continuous integration, continuous delivery pipelines, and cloud engineering projects. Built with Next.js and Three.js for rendering 3D infrastructure topology, and deployed on Cloudflare Pages using edge computing capabilities.

## Architecture and Stack

* Framework: Next.js App Router
* 3D Rendering: React Three Fiber
* Styling: Tailwind CSS
* UI Components: shadcn
* Deployment Target: Cloudflare Pages
* Edge Compute: Cloudflare Workers
* Build Tooling: Wrangler

## Deployment Pipeline

The application relies on Cloudflare Pages for global distribution. Next.js server side capabilities are executed at the edge using the nodejs_compat flag via the Cloudflare adapter.

1. Build Phase: Generates static assets and compiles edge functions.
2. Optimization: Images and static content are cached by Cloudflare edge nodes.
3. Edge Execution: Dynamic routes and security headers are processed by Cloudflare Workers.

## Local Development Environment

### Prerequisites

* Node.js 22 (see .node-version)
* npm (the lockfile is package-lock.json)

### Setup Instructions

1. Clone the repository to your local machine.
2. Install project dependencies using npm ci.
3. Start the local development server using npm run dev.
5. Before deploying, run the canvas smoke test against the build (`npm run build`, serve `out/` on port 4173, then `npm run smoke`). It fails if the particle shader does not compile in Chromium or WebKit.
4. Access the application on localhost port 3000.

## Cloud Environment Configuration

The production environment expects specific security headers injected at the edge. The deployment process requires valid Cloudflare credentials configured in your environment to interface with the Pages API.
