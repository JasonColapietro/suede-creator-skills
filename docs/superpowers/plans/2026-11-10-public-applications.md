# Public application register

Keep one source-linked row per public direct-submission issue, with the exact requested skill scope. The register covers maintainer submissions and requests made on their behalf, not scraped discovery or private messages. Include the public GitHub applicant handle and profile link, as requested. Do not copy emails, private profile details, issue bodies or contact details.

- Import all public GitHub issues using a narrow field parser and a public-repository guard. Retain only issue number, public applicant handle, public repository, kind, requested names, submission date and issue state. Historical form exceptions are explicit.
- Keep editorial review/feature associations separate from imported applications. Never infer admission, review or featuring from an open or closed issue. Resolve live review and placement against current feature metadata; scored listing status comes from current catalog records and exact requested names.
- Generate `/applications/` through the existing directory page layout, link it from Submit and Featured, keep it indexable and include it in the sitemap. Show source dates and a link to the live issue list for newer requests.
- Refresh the register during the existing weekly refresh, which proposes changes on its existing branch. No new paid jobs, external posts or outreach.
- Test privacy, selected-skill scope, duplicate issue rejection, pending features, rejected/closed applications, rendering, canonical URLs and sitemap. Run the full local suite and report failures accurately.
