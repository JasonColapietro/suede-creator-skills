# License evidence repair

Multiple license files do not establish an OR relationship. Preserve every nearest-directory license file as evidence, including unknown terms; summarize multiple files as review required and link that summary to the containing directory. A single file's display label must describe that file, rather than conflicting skill frontmatter. Explicit SPDX AND/OR expressions must remain intact and unknown identifiers must never become open-license approval.

Acceptance: MIT with unknown restrictions remains review required; conflicting filename/text uses detected text; generic LICENSE plus variants preserves all evidence; explicit multi-license SPDX expressions retain all terms; nearest directory wins. Test parser regressions against the old implementation before changing it, then run Python directory tests and npm test. No publication or external source refresh is required.

Independent review identified two additional ways to drop unknown terms: accepting only the first SPDX declaration, and truncating long frontmatter text to a recognized prefix. Conflicting/empty declarations now produce Other, and prefix truncation is removed. A reviewer-authored integration test verifies curation and rendered HTML preserve each evidence file and keep unknown restrictions unapproved. Existing two-file tests now expect review rather than an inferred OR.
