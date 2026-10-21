# CloudFront runtime API configuration

Both Angular applications load /app-config.json before bootstrapping.
For local ng serve, each project's public/app-config.json points to localhost.
For AWS, upload deployment/cloudfront/app-config.json to the ROOT of each S3 bucket
AFTER uploading the compiled browser output. Never deploy the local localhost JSON as the final AWS configuration.

CloudFront distribution per UI:
- Private S3 origin with Origin Access Control (OAC), default behavior GET/HEAD.
- An API origin backed by an HTTPS reverse proxy / load balancer.
- Behavior /api/v1/* forwards to the API origin, with caching disabled.
- Forward all API methods (GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE).
- Forward Authorization, Content-Type, required headers, query strings and cookies where used.
- Configure a suitable origin request policy; do not forward the viewer Host header unless the origin supports it.
- The reverse proxy must route /api/v1/auth/* to NestJS port 3001, and the remaining /api/v1/* to Spring Boot port 8081. Preserve request paths.
- Use HTTPS from CloudFront to the API origin, with a trusted certificate and an appropriate DNS hostname.
- Ensure POST/PUT/PATCH/DELETE are never cached.
- Disable caching for /app-config.json (separate behavior) and invalidate /app-config.json after replacement.
- SPA fallback must not rewrite /api/v1/* failures to index.html. Prefer a CloudFront Function scoped to the default S3 behavior for extensionless navigation routes rather than global 403/404 -> 200 rules.
- Do not expose PostgreSQL, Kafka or container API ports publicly.
- CloudFront's distribution domain alone is not a secure origin restriction. Apply origin access restrictions appropriate to the selected load balancer / proxy.

Deploy the contents of dist/client/browser or dist/admin/browser to their respective buckets.
Upload deployment/cloudfront/app-config.json last to each bucket as app-config.json.
Test /app-config.json, login, refresh, portfolio and order submissions from CloudFront.
