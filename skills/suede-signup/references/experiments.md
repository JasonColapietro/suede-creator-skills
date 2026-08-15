# Signup Experiment Menu

Candidate tests for signup flows, grouped by family. Read this when the audit has
produced test hypotheses and you need the specific variants worth running for a
given family. Design, sizing, and stopping rules belong to `suede-ab-testing`;
this file only supplies the candidate list.

## Form Design Experiments

**Layout & Structure**
- Single-step vs. multi-step signup flow
- Multi-step with progress bar vs. without
- 1-column vs. 2-column field layout
- Form embedded on page vs. separate signup page
- Horizontal vs. vertical field alignment

**Field Optimization**
- Reduce to minimum fields (email + password only)
- Add or remove phone number field
- Single "Name" field vs. "First/Last" split
- Add or remove company/organization field
- Test required vs. optional field balance

**Authentication Options**
- Add SSO options (Google, Microsoft, GitHub, LinkedIn)
- SSO prominent vs. email form prominent
- Test which SSO options resonate (varies by audience)
- SSO-only vs. SSO + email option

**Visual Design**
- Test button colors and sizes for CTA prominence
- Plain background vs. product-related visuals
- Test form container styling (card vs. minimal)
- Mobile-optimized layout testing

---

## Copy & Messaging Experiments

**Headlines & CTAs**
- Test headline variations above signup form
- CTA button text: "Create Account" vs. "Start Free Trial" vs. "Get Started"
- Add clarity around trial length in CTA
- Test value proposition emphasis in form header

**Microcopy**
- Field labels: minimal vs. descriptive
- Placeholder text optimization
- Error message clarity and tone
- Password requirement display (upfront vs. on error)

**Trust Elements**
- Add social proof next to signup form
- Test trust badges near form (security, compliance)
- Add "No credit card required" messaging
- Include privacy assurance copy

---

## Trial & Commitment Experiments

**Free Trial Variations**
- Credit card required vs. not required for trial
- Test trial length impact (7 vs. 14 vs. 30 days)
- Freemium vs. free trial model
- Trial with limited features vs. full access

**Friction Points**
- Email verification required vs. delayed vs. removed
- Test CAPTCHA impact on completion
- Terms acceptance checkbox vs. implicit acceptance
- Phone verification for high-value accounts

---

## Post-Submit Experiments

- Clear next steps messaging after signup
- Instant product access vs. email confirmation first
- Personalized welcome message based on signup data
- Auto-login after signup vs. require login
