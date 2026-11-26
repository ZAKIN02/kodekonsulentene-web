---
name: storybrand
description: Clarify a company's marketing message using Donald Miller's StoryBrand framework (updated for StoryBrand 2.0). Use this skill whenever the user wants to create a BrandScript, clarify their messaging, write a one-liner or elevator pitch, define their controlling idea, audit a website or pitch against the StoryBrand framework, or position their customer as the hero. Also trigger when the user mentions "StoryBrand", "SB7", "BrandScript", "clarify my message", "customer is the hero", "marketing message", "messaging framework", or asks for help making their website copy, sales pitch, or brand story clearer and more compelling. If the user is working on positioning or messaging for any venture and the message feels muddled, proactively suggest this workflow.
---

# StoryBrand Messaging Skill

Help the user clarify their company's message using Donald Miller's StoryBrand framework (SB7), incorporating the StoryBrand 2.0 updates (2025 edition). The core premise: customers are bombarded with noise, so they only engage with brands that communicate simply and clearly. If you confuse, you lose. The fix is to invite the customer into a story where THEY are the hero and the brand is the guide.

## The framework in one breath

A character (the customer) who wants something encounters a problem before they can get it. At the peak of their frustration, a guide (the brand) steps in, demonstrates empathy and competency, gives them a plan, and calls them to action. That action helps them avoid failure and achieve success, transforming who they are.

## Three modes

Determine which mode fits the request, confirm briefly if ambiguous, then proceed.

### Mode A: Guided session
For users who want to think it through. Walk through the seven elements one at a time, workbook style. For each element: ask the coaching questions, brainstorm together, then converge on a short "BrandScript decision" before moving on. One element (or one tightly related pair) per exchange. Never dump all seven questions at once. Read `references/framework.md` before starting and follow its element-by-element coaching questions.

### Mode B: Draft first
For users who know the framework or want speed. Gather a basic understanding of the business (ask only if context is missing: what they sell, to whom, and what the customer struggles with). Then draft a complete BrandScript in one pass and refine it with the user. Read `references/framework.md` to ensure every element meets the quality bar.

### Mode C: Audit
For evaluating existing messaging (a website, deck, pitch, or email). Read `references/checklists.md`. Map every major message in the material to one of the seven elements, flag what is missing, what positions the brand as hero instead of guide, and what is "inside language." Score against the audit checklist and give prioritized rewrite recommendations with before/after examples.

### Direct application requests
When the user asks for a specific artifact — a one-liner, elevator pitch, tagline, or website header — don't force a full BrandScript first. Read `references/applications.md`, gather only the inputs that artifact needs (customer, problem, plan/mechanism, success — a mini-BrandScript), produce the artifact, and then offer the full BrandScript as a follow-up.

## Quality bar (applies to all modes)

These are the failure modes to actively prevent:

1. **Brand-as-hero language.** Strike "we are the leading..." phrasing. The customer is the hero; the brand demonstrates empathy and competency as the guide. Playing the hero is the fastest way to destroy a brand.
2. **Selling external solutions only.** Companies sell solutions to external problems, but customers buy solutions to internal problems. Every BrandScript must name the internal frustration, not just the surface task.
3. **Clutter.** A great BrandScript leaves good material on the editing room floor. Each element should be one or two short, plain sentences. Cut inside language and jargon a customer would not use.
4. **Clever over clear.** Sound bites must be clear, not clever. If a smart stranger could not repeat back what the company does after one read, rewrite it.
5. **Vague stakes.** Failure is the salt in the recipe: some is required, too much repels. Name two or three genuine, concrete negative consequences (fewer only if fewer are truthful), never a wall of fear.
6. **No villain.** Identify a single root-cause villain (a thing, not a competitor brand) that creates the three problem levels.

## StoryBrand 2.0 updates (always apply these)

- **Empathy + Competency** (not "authority"). The guide builds trust through empathy first, then earns respect by demonstrating competency. Avoid language that positions the brand above the customer.
- **The Controlling Idea.** Every completed BrandScript must distill into one controlling idea: the single moral or theme of the brand's story that every message, from tagline to social post, reinforces. Test: can it be stated in one sentence and repeated everywhere?
- **The Story Gap.** Frame the customer's three problem levels (external, internal, philosophical) as a gap the brand closes. Opening and closing story gaps is what holds attention.
- **Campaign discipline: create, edit, repeat.** Messaging only works through repetition of the same sound bites across every channel.

## Output format

Deliver the finished BrandScript in chat as markdown using the exact template in `references/brandscript-template.md`. Always include the Controlling Idea and the One-Liner at the top; they are the most portable artifacts. Offer (do not auto-create) a Word document version if the user wants to share it.

After delivering a BrandScript, offer next-step applications: website wireframe copy, email sequence, sales one-liner, elevator pitch, or tagline. When the user wants these, read `references/applications.md`.

## Reference files

- `references/framework.md` - All seven elements in depth: principles, coaching questions, quality criteria, and common mistakes per element. Read before any guided session or first draft.
- `references/brandscript-template.md` - The exact output template.
- `references/applications.md` - Turning a BrandScript into assets: controlling idea, one-liner, sound bites, website wireframe, email campaigns, sales scripts.
- `references/checklists.md` - Audit and editing checklists for BrandScripts, websites, keynotes, emails, and staff messaging. Read for Mode C and for final QA of any BrandScript.
- `references/examples.md` - Calibration examples from stories (Star Wars, Hunger Games) and brands (CarMax, Allstate), plus one complete worked business example. Read when the user wants examples or when calibrating quality.

## Writing style for all StoryBrand outputs

Short sentences. Plain words. Concrete nouns. Second person where natural ("You shouldn't have to..."). Never use em dashes in any deliverable. Cut every word that does not help the customer survive and thrive.
